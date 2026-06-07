from __future__ import annotations

import json
import math
import shutil
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WORKSPACE = Path(__file__).resolve().parents[1]
SOURCE_ROOT = WORKSPACE / "素材"
OUTPUT_ROOT = WORKSPACE / "素材整理"

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
MAX_GIF_EDGE = 192

ANIMAL_DIRS = {
    "hamster": ["01_hamster_仓鼠", "hamster_cropped_8forms_6states"],
    "rabbit": ["02_rabbit_兔子", "rabbit_8forms_6states_cropped"],
    "penguin": ["03_penguin_企鹅", "penguin_cropped_8forms_6states"],
    "fox": ["04_fox_狐狸", "fox_8forms_6states_cropped"],
    "dragon": ["05_dragon_龙", "dragon_8forms_6states_cropped"],
    "shiba": ["06_shiba_柴犬", "shiba_cropped_8forms_6states"],
    "owl": ["07_owl_猫头鹰", "owl_8forms_6states_cropped"],
    "cat": ["08_cat_猫_png", "cat_7forms_6states_cropped"],
}

ANIMAL_NAMES = {
    "hamster": {"en": "Hamster", "zh": "仓鼠"},
    "rabbit": {"en": "Rabbit", "zh": "兔子"},
    "penguin": {"en": "Penguin", "zh": "企鹅"},
    "fox": {"en": "Fox", "zh": "狐狸"},
    "dragon": {"en": "Dragon", "zh": "龙"},
    "shiba": {"en": "Shiba", "zh": "柴犬"},
    "owl": {"en": "Owl", "zh": "猫头鹰"},
    "cat": {"en": "Cat", "zh": "猫"},
}

FORM_ORDER = ["baby", "teen", "base", "active", "steady", "explorer", "rare", "secret"]
FORM_IDS = {
    "baby": "01_baby",
    "teen": "02_teen",
    "base": "03_base",
    "active": "04_active",
    "steady": "05_steady",
    "explorer": "06_explorer",
    "rare": "07_rare",
    "secret": "08_secret",
}

STATE_ORDER = ["static", "wake", "tap", "feed", "happy", "no_food"]
STATE_IDS = {
    "static": "01_static",
    "wake": "02_wake",
    "tap": "03_tap",
    "feed": "04_feed",
    "happy": "05_happy",
    "no_food": "06_no_food",
}

STATE_KEYWORDS = {
    "no_food": ["no_food", "no-food", "nofood"],
    "static": ["static"],
    "wake": ["wake"],
    "tap": ["tap"],
    "feed": ["feed"],
    "happy": ["happy"],
}


@dataclass
class StateAsset:
    source: Path
    source_kind: str
    filled_from: str | None = None


@dataclass
class FormAsset:
    key: str
    form_id: str
    source_name: str | None = None
    states: dict[str, StateAsset] = field(default_factory=dict)
    single_form_source: Path | None = None
    extras: list[Path] = field(default_factory=list)


@dataclass
class AnimalAsset:
    slug: str
    forms: dict[str, FormAsset] = field(default_factory=dict)
    extras: list[Path] = field(default_factory=list)
    source_dirs: list[Path] = field(default_factory=list)


def rel(path: Path) -> str:
    try:
        return path.relative_to(WORKSPACE).as_posix()
    except ValueError:
        return path.as_posix()


def next_output_dir() -> Path:
    if not OUTPUT_ROOT.exists():
        return OUTPUT_ROOT
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return WORKSPACE / f"素材整理_{stamp}"


def form_key_from_name(name: str) -> str | None:
    lower = name.lower()
    for key in ["secret", "rare", "explorer", "steady", "active", "base", "teen", "baby"]:
        if key in lower:
            return key

    prefix = lower.split("_", 1)[0]
    numeric_map = {
        "01": "baby",
        "02": "teen",
        "03": "base",
        "04": "active",
        "05": "steady",
        "06": "explorer",
        "07": "rare",
        "08": "secret",
    }
    if prefix in numeric_map:
        return numeric_map[prefix]
    return None


def state_key_from_name(name: str) -> str | None:
    lower = name.lower()
    if "sheet" in lower or "overview" in lower:
        return None
    for state, keywords in STATE_KEYWORDS.items():
        if any(keyword in lower for keyword in keywords):
            return state

    prefix = lower.split("_", 1)[0]
    numeric_map = {
        "01": "static",
        "02": "wake",
        "03": "tap",
        "04": "feed",
        "05": "happy",
        "06": "no_food",
    }
    return numeric_map.get(prefix)


def get_form(animal: AnimalAsset, key: str) -> FormAsset:
    if key not in animal.forms:
        animal.forms[key] = FormAsset(key=key, form_id=FORM_IDS[key])
    return animal.forms[key]


def scan_assets() -> dict[str, AnimalAsset]:
    animals = {slug: AnimalAsset(slug=slug) for slug in ANIMAL_DIRS}

    for slug, dir_names in ANIMAL_DIRS.items():
        animal = animals[slug]
        for dir_name in dir_names:
            directory = SOURCE_ROOT / dir_name
            if not directory.exists():
                continue
            animal.source_dirs.append(directory)

            if "cropped" not in dir_name:
                for image in sorted(directory.glob("*.png")):
                    form_key = form_key_from_name(image.stem)
                    if form_key is None:
                        animal.extras.append(image)
                        continue
                    form = get_form(animal, form_key)
                    form.single_form_source = image
                    form.source_name = form.source_name or image.stem
                continue

            for child in sorted(directory.iterdir()):
                if child.is_file():
                    animal.extras.append(child)
                    continue
                if not child.is_dir():
                    continue

                form_key = form_key_from_name(child.name)
                if form_key is None:
                    animal.extras.append(child)
                    continue

                form = get_form(animal, form_key)
                form.source_name = child.name
                for file_path in sorted(child.iterdir()):
                    if file_path.suffix.lower() not in IMAGE_SUFFIXES:
                        form.extras.append(file_path)
                        continue
                    state_key = state_key_from_name(file_path.stem)
                    if state_key is None:
                        form.extras.append(file_path)
                        continue
                    form.states[state_key] = StateAsset(source=file_path, source_kind="state_crop")

    for animal in animals.values():
        for form_key in FORM_ORDER:
            form = animal.forms.get(form_key)
            if form is None:
                continue
            for state_key in STATE_ORDER:
                if state_key in form.states:
                    continue
                if form.single_form_source is not None:
                    form.states[state_key] = StateAsset(
                        source=form.single_form_source,
                        source_kind="single_form_fill",
                        filled_from=form_key,
                    )
                elif "static" in form.states:
                    form.states[state_key] = StateAsset(
                        source=form.states["static"].source,
                        source_kind="static_fill",
                        filled_from="static",
                    )

    return animals


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        return bbox
    return (0, 0, image.width, image.height)


def normalized_sprite(image_path: Path, canvas_edge: int = MAX_GIF_EDGE) -> Image.Image:
    image = Image.open(image_path).convert("RGBA")
    bbox = alpha_bbox(image)
    cropped = image.crop(bbox)

    max_content = int(canvas_edge * 0.82)
    scale = min(max_content / max(cropped.width, cropped.height), 1.0)
    new_size = (
        max(1, int(round(cropped.width * scale))),
        max(1, int(round(cropped.height * scale))),
    )
    if new_size != cropped.size:
        cropped = cropped.resize(new_size, Image.Resampling.NEAREST)

    canvas = Image.new("RGBA", (canvas_edge, canvas_edge), (0, 0, 0, 0))
    x = (canvas_edge - cropped.width) // 2
    y = (canvas_edge - cropped.height) // 2
    canvas.alpha_composite(cropped, (x, y))
    return canvas


def transform_frame(base: Image.Image, state: str, step: int, total: int) -> Image.Image:
    phase = step / max(total - 1, 1)
    angle = 0.0
    dx = 0
    dy = 0
    sx = 1.0
    sy = 1.0

    if state == "static":
        dy = round(math.sin(phase * math.tau) * 1.5)
    elif state == "wake":
        dy = round(-6 * math.sin(phase * math.pi))
        sx = 1.0 - 0.04 * math.sin(phase * math.pi)
        sy = 1.0 + 0.06 * math.sin(phase * math.pi)
    elif state == "tap":
        angle = [-4, -2, 3, 4, 1, -2, 0, 0][step % 8]
        dx = [-3, -2, 2, 3, 1, -1, 0, 0][step % 8]
    elif state == "feed":
        dy = [0, 1, 3, 5, 3, 1, 0, 0][step % 8]
        sx = [1.0, 1.02, 1.04, 1.02, 1.0, 0.99, 1.0, 1.0][step % 8]
    elif state == "happy":
        dy = [0, -4, -10, -14, -8, -2, 1, 0][step % 8]
        sx = [1.0, 0.98, 0.96, 0.98, 1.02, 1.04, 1.0, 1.0][step % 8]
        sy = [1.0, 1.03, 1.06, 1.03, 0.98, 0.96, 1.0, 1.0][step % 8]
    elif state == "no_food":
        dx = [0, -3, 3, -2, 2, -1, 1, 0][step % 8]
        angle = [0, -3, 3, -2, 2, -1, 1, 0][step % 8]

    transformed = base
    if sx != 1.0 or sy != 1.0:
        new_size = (
            max(1, int(round(base.width * sx))),
            max(1, int(round(base.height * sy))),
        )
        transformed = base.resize(new_size, Image.Resampling.NEAREST)

    if angle:
        transformed = transformed.rotate(angle, resample=Image.Resampling.NEAREST, expand=False)

    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    x = (base.width - transformed.width) // 2 + dx
    y = (base.height - transformed.height) // 2 + dy
    canvas.alpha_composite(transformed, (x, y))
    return canvas


def save_gif(frames: list[Image.Image], out_path: Path, duration: int = 90) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
        transparency=0,
    )


def make_state_gif(source: Path, state: str, out_path: Path) -> None:
    base = normalized_sprite(source)
    frame_count = 8
    frames = [transform_frame(base, state, i, frame_count) for i in range(frame_count)]
    save_gif(frames, out_path, duration=90)


def make_form_cycle(state_sources: dict[str, Path], out_path: Path) -> None:
    frames = []
    durations = []
    for state in STATE_ORDER:
        source = state_sources.get(state)
        if source is None:
            continue
        frames.append(normalized_sprite(source))
        durations.append(450 if state == "static" else 320)
    if not frames:
        return
    out_path.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=0,
    )


def make_animal_overview(animal_dir: Path, animal: AnimalAsset) -> None:
    tiles = []
    labels = []
    for form_key in FORM_ORDER:
        form = animal.forms.get(form_key)
        if not form:
            continue
        state = form.states.get("static") or next(iter(form.states.values()), None)
        if state is None:
            continue
        tiles.append(normalized_sprite(state.source, canvas_edge=128))
        labels.append(form.form_id)
    if not tiles:
        return

    columns = 4
    tile_w = 148
    tile_h = 164
    rows = math.ceil(len(tiles) / columns)
    sheet = Image.new("RGBA", (columns * tile_w, rows * tile_h), (18, 20, 22, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, tile in enumerate(tiles):
        col = index % columns
        row = index // columns
        x = col * tile_w + 10
        y = row * tile_h + 8
        sheet.alpha_composite(tile, (x, y))
        draw.text((col * tile_w + 12, y + 132), labels[index], fill=(230, 235, 238, 255), font=font)

    sheet.save(animal_dir / "overview.png")


def copy_file(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def write_readme(out_dir: Path, animals: dict[str, AnimalAsset], manifest: dict) -> None:
    lines = [
        "# 素材整理结果",
        "",
        f"生成时间：{manifest['generatedAt']}",
        f"源目录：`{rel(SOURCE_ROOT)}`",
        "",
        "## 输出结构",
        "",
        "- `animals/<animal>/forms/<form>/states/`：按动物、形态、状态复制整理后的 PNG。",
        "- `animals/<animal>/forms/<form>/animations/`：根据状态图生成的 GIF 动图。",
        "- `animals/<animal>/overview.png`：该动物各形态静态预览。",
        "- `manifest.json`：完整分类索引、来源路径、补齐信息和生成文件路径。",
        "",
        "## 状态顺序",
        "",
        ", ".join(f"{STATE_IDS[state]}" for state in STATE_ORDER),
        "",
        "## 识别到的动物",
        "",
    ]
    for slug in sorted(animals):
        animal = animals[slug]
        name = ANIMAL_NAMES[slug]
        form_count = sum(1 for key in FORM_ORDER if key in animal.forms)
        state_count = sum(len(form.states) for form in animal.forms.values())
        lines.append(f"- `{slug}` / {name['zh']}：{form_count} 个形态，{state_count} 张状态图")

    lines.extend(
        [
            "",
            "## 说明",
            "",
            "- 原始 `素材` 目录未被修改。",
            "- 已优先使用裁剪好的 6 状态素材；缺失状态时才用单张形态图补齐。",
            "- GIF 是根据已有状态图做的轻量动作合成，保持原角色比例、颜色和像素风格，不引入 AI 新画面。",
            "- 若后续要作为 Zepp OS 正式宠物包，还需要再跑包体积、帧对齐、AOD 和实机可读性验证。",
            "",
        ]
    )
    (out_dir / "README.md").write_text("\n".join(lines), encoding="utf-8")


def organize() -> Path:
    if not SOURCE_ROOT.exists():
        raise FileNotFoundError(f"Source directory not found: {SOURCE_ROOT}")

    animals = scan_assets()
    out_dir = next_output_dir()
    out_dir.mkdir(parents=True, exist_ok=False)

    manifest = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "sourceRoot": rel(SOURCE_ROOT),
        "outputRoot": rel(out_dir),
        "animals": {},
        "warnings": [],
    }

    for slug, animal in animals.items():
        animal_dir = out_dir / "animals" / slug
        extras_dir = animal_dir / "source_extras"
        animal_manifest = {
            "slug": slug,
            "name": ANIMAL_NAMES[slug],
            "sourceDirs": [rel(path) for path in animal.source_dirs],
            "forms": {},
            "extras": [],
        }

        for extra in animal.extras:
            if extra.is_file():
                destination = extras_dir / extra.name
                copy_file(extra, destination)
                animal_manifest["extras"].append(rel(destination))

        for form_key in FORM_ORDER:
            form = animal.forms.get(form_key)
            if not form:
                manifest["warnings"].append(f"{slug}: missing form {FORM_IDS[form_key]}")
                continue

            form_dir = animal_dir / "forms" / form.form_id
            states_dir = form_dir / "states"
            animations_dir = form_dir / "animations"
            form_manifest = {
                "key": form.key,
                "formId": form.form_id,
                "sourceName": form.source_name,
                "singleFormSource": rel(form.single_form_source) if form.single_form_source else None,
                "states": {},
                "animations": {},
                "extras": [],
            }

            for extra in form.extras:
                if extra.is_file():
                    destination = form_dir / "source_extras" / extra.name
                    copy_file(extra, destination)
                    form_manifest["extras"].append(rel(destination))

            state_sources: dict[str, Path] = {}
            for state_key in STATE_ORDER:
                state_asset = form.states.get(state_key)
                if not state_asset:
                    manifest["warnings"].append(f"{slug}/{form.form_id}: missing state {STATE_IDS[state_key]}")
                    continue

                state_file = states_dir / f"{STATE_IDS[state_key]}.png"
                copy_file(state_asset.source, state_file)

                gif_file = animations_dir / f"{STATE_IDS[state_key]}.gif"
                make_state_gif(state_asset.source, state_key, gif_file)
                state_sources[state_key] = state_asset.source

                form_manifest["states"][state_key] = {
                    "stateId": STATE_IDS[state_key],
                    "source": rel(state_asset.source),
                    "output": rel(state_file),
                    "sourceKind": state_asset.source_kind,
                    "filledFrom": state_asset.filled_from,
                    "animation": rel(gif_file),
                }
                form_manifest["animations"][state_key] = rel(gif_file)

            cycle_file = animations_dir / "form_state_cycle.gif"
            make_form_cycle(state_sources, cycle_file)
            if cycle_file.exists():
                form_manifest["animations"]["form_state_cycle"] = rel(cycle_file)

            animal_manifest["forms"][form_key] = form_manifest

        make_animal_overview(animal_dir, animal)
        if (animal_dir / "overview.png").exists():
            animal_manifest["overview"] = rel(animal_dir / "overview.png")

        (animal_dir / "manifest.json").write_text(
            json.dumps(animal_manifest, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        manifest["animals"][slug] = animal_manifest

    write_readme(out_dir, animals, manifest)
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return out_dir


if __name__ == "__main__":
    result = organize()
    print(result)
