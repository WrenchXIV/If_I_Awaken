"""
Generate pitch-2026.pptx from the 19-slide pitch site.
Output is editable in Google Slides: every text box is editable, every
shape is movable/recolorable, every photo can be swapped.

Run:  python3 make_pptx.py
Output: pitch-2026.pptx in the same folder.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from copy import deepcopy
import os

ASSETS = os.path.join(os.path.dirname(__file__), "assets", "photos")

# ----- Design tokens (mirror the site) -----------------------------------
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

INK = RGBColor(0x0A, 0x0A, 0x0A)
PAPER = RGBColor(0xF2, 0xED, 0xE2)
PAPER_DIM = RGBColor(0xE8, 0xE0, 0xCF)
RED = RGBColor(0xD6, 0x3A, 0x3F)
RED_DEEP = RGBColor(0xB8, 0x22, 0x28)
GOLD = RGBColor(0xC7, 0xA8, 0x6A)
GREEN = RGBColor(0x46, 0xC3, 0x6B)
WHITE = RGBColor(0xF2, 0xED, 0xE2)
WHITE_MUTE = RGBColor(0xB3, 0xAE, 0xA5)
WHITE_DIM = RGBColor(0x80, 0x7D, 0x77)
INK_MUTE = RGBColor(0x4A, 0x47, 0x42)
RULE_DARK = RGBColor(0x2E, 0x2C, 0x2A)
RULE_LIGHT = RGBColor(0xCE, 0xC8, 0xBC)

# Font stack — these all map cleanly to Google Fonts (user can install in
# Google Slides via Format → Font → More fonts).
F_DISPLAY = "Oswald"      # condensed sans for big headlines
F_TIGHT = "Inter Tight"   # sans for stats and modern headlines
F_SERIF = "Fraunces"      # italic serif for editorial moments
F_BODY = "Inter"          # body
F_MONO = "JetBrains Mono" # eyebrows, labels, chrome


# ----- Helpers -----------------------------------------------------------

def blank_slide(prs, bg=INK):
    """Add a blank slide with given solid bg color."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank layout
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = bg
    return slide


def add_text(slide, left, top, width, height, text,
             font=F_BODY, size=12, color=WHITE, bold=False, italic=False,
             align="left", anchor="top", letter_spacing=None, line_spacing=None):
    """Add a single-run textbox. Returns the textbox shape."""
    tb = slide.shapes.add_textbox(left, top, width, height)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}.get(anchor, MSO_ANCHOR.TOP)
    p = tf.paragraphs[0]
    p.alignment = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}.get(align, PP_ALIGN.LEFT)
    if line_spacing:
        p.line_spacing = line_spacing
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.bold = bold
    run.font.italic = italic
    if letter_spacing is not None:
        # python-pptx exposes character spacing through XML
        rPr = run._r.get_or_add_rPr()
        rPr.set("spc", str(letter_spacing))
    return tb


def add_paragraphs(slide, left, top, width, height, paragraphs,
                   font=F_BODY, size=14, color=WHITE, align="left", anchor="top", line_spacing=1.4):
    """
    paragraphs: list of strings OR list of dicts:
      { "text": str, "size": int, "color": RGB, "font": str, "bold": bool, "italic": bool,
        "align": str, "letter_spacing": int }
    Each list entry becomes a NEW paragraph (line break between them).
    For inline styled runs within a single paragraph, use add_inline_text.
    """
    tb = slide.shapes.add_textbox(left, top, width, height)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}.get(anchor, MSO_ANCHOR.TOP)
    for i, item in enumerate(paragraphs):
        spec = item if isinstance(item, dict) else {"text": item}
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}.get(spec.get("align", align), PP_ALIGN.LEFT)
        p.line_spacing = spec.get("line_spacing", line_spacing)
        if spec.get("space_after"):
            p.space_after = Pt(spec["space_after"])
        if spec.get("space_before"):
            p.space_before = Pt(spec["space_before"])
        run = p.add_run()
        run.text = spec.get("text", "")
        run.font.name = spec.get("font", font)
        run.font.size = Pt(spec.get("size", size))
        run.font.color.rgb = spec.get("color", color)
        run.font.bold = spec.get("bold", False)
        run.font.italic = spec.get("italic", False)
        if "letter_spacing" in spec:
            rPr = run._r.get_or_add_rPr()
            rPr.set("spc", str(spec["letter_spacing"]))
    return tb


def add_inline_text(slide, left, top, width, height, runs,
                    font=F_BODY, size=14, color=WHITE, align="left", anchor="top", line_spacing=1.4):
    """
    Add a SINGLE paragraph composed of multiple styled runs (inline, no line breaks).
    Use for mid-sentence emphasis (bold, color shift, etc.).
    """
    tb = slide.shapes.add_textbox(left, top, width, height)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}.get(anchor, MSO_ANCHOR.TOP)
    p = tf.paragraphs[0]
    p.alignment = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}.get(align, PP_ALIGN.LEFT)
    p.line_spacing = line_spacing
    for spec in runs:
        if isinstance(spec, str):
            spec = {"text": spec}
        run = p.add_run()
        run.text = spec.get("text", "")
        run.font.name = spec.get("font", font)
        run.font.size = Pt(spec.get("size", size))
        run.font.color.rgb = spec.get("color", color)
        run.font.bold = spec.get("bold", False)
        run.font.italic = spec.get("italic", False)
        if "letter_spacing" in spec:
            rPr = run._r.get_or_add_rPr()
            rPr.set("spc", str(spec["letter_spacing"]))
    return tb


def add_rect(slide, left, top, width, height, fill=None, line=None, line_width=None):
    """Add a rectangle shape."""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        if line_width:
            shape.line.width = Pt(line_width)
    return shape


def add_line(slide, x1, y1, x2, y2, color=RED, width=1.0):
    line = slide.shapes.add_connector(1, x1, y1, x2, y2)
    line.line.color.rgb = color
    line.line.width = Pt(width)
    return line


def add_image(slide, path, left, top, width, height=None):
    return slide.shapes.add_picture(path, left, top, width=width, height=height)


def add_eyebrow(slide, left, top, text, color=RED):
    """The small monospace eyebrow with red underline."""
    add_text(slide, left, top, Inches(8), Inches(0.3), text,
             font=F_MONO, size=10, color=color, letter_spacing=200,
             bold=False)
    # red underline rule
    add_line(slide, left, top + Inches(0.28), left + Inches(min(8, len(text)*0.09)), top + Inches(0.28), color=color, width=1)


def add_pill_rect(slide, left, top, width, height, fill, text, font=F_DISPLAY, size=40, color=WHITE, bold=True, align="left"):
    """A solid-fill rectangle with text inside it (used for the cover red banner)."""
    rect = add_rect(slide, left, top, width, height, fill=fill)
    tf = rect.text_frame
    tf.margin_left = Inches(0.18)
    tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.04)
    tf.margin_bottom = Inches(0.04)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}.get(align, PP_ALIGN.LEFT)
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.bold = bold
    return rect


def add_dim_overlay(slide, opacity_pct=70):
    """Add a near-black overlay on top of a photo bg to make text readable."""
    rect = add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    rect.fill.transparency = 0
    # python-pptx doesn't directly expose fill transparency, but we can set
    # the alpha via XML
    from pptx.oxml.ns import qn
    sp = rect.fill._xPr
    # We'll set transparency on the solidFill
    solidFill = sp.find(qn("a:solidFill"))
    if solidFill is not None:
        srgb = solidFill.find(qn("a:srgbClr"))
        if srgb is not None:
            # set alpha
            alpha = srgb.find(qn("a:alpha"))
            if alpha is None:
                from lxml import etree
                alpha_el = etree.SubElement(srgb, qn("a:alpha"))
                alpha_el.set("val", str(int(opacity_pct * 1000)))
    return rect


def add_table(slide, left, top, width, height, headers, rows,
              header_color=RED, row_color=WHITE, highlight_rows=None,
              fill_dark=True):
    """Add an editable table."""
    n_cols = len(headers)
    n_rows = len(rows) + 1
    table_shape = slide.shapes.add_table(n_rows, n_cols, left, top, width, height)
    table = table_shape.table

    # Style headers
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = INK if fill_dark else PAPER
        tf = cell.text_frame
        tf.margin_left = Inches(0.12)
        tf.margin_right = Inches(0.12)
        tf.margin_top = Inches(0.08)
        tf.margin_bottom = Inches(0.08)
        p = tf.paragraphs[0]
        run = p.add_run()
        run.text = h
        run.font.name = F_MONO
        run.font.size = Pt(10)
        run.font.color.rgb = header_color
        run.font.bold = False
        rPr = run._r.get_or_add_rPr()
        rPr.set("spc", "200")

    # Style data rows
    for i, row in enumerate(rows):
        is_us = highlight_rows and (i in highlight_rows or highlight_rows == "all")
        for j, val in enumerate(row):
            cell = table.cell(i + 1, j)
            cell.fill.solid()
            if is_us:
                cell.fill.fore_color.rgb = RGBColor(0x35, 0x10, 0x12) if fill_dark else PAPER_DIM
            else:
                cell.fill.fore_color.rgb = INK if fill_dark else PAPER
            tf = cell.text_frame
            tf.margin_left = Inches(0.12)
            tf.margin_right = Inches(0.12)
            tf.margin_top = Inches(0.08)
            tf.margin_bottom = Inches(0.08)
            p = tf.paragraphs[0]
            run = p.add_run()
            run.text = str(val)
            run.font.name = F_TIGHT
            run.font.size = Pt(12)
            if is_us:
                run.font.color.rgb = RED if j == 0 else WHITE
                run.font.bold = True
            else:
                run.font.color.rgb = row_color if fill_dark else INK
    return table_shape


def add_timeline(slide, current_step):
    """The persistent pilot→album→awakening→show timeline (drawn at top of slide)."""
    y = Inches(0.55)
    left_pad = Inches(0.6)
    right_pad = Inches(0.6)
    track_w = SLIDE_W - left_pad - right_pad

    # Background line
    add_line(slide, left_pad, y, left_pad + track_w, y, color=RGBColor(0x60, 0x20, 0x22), width=1.5)
    # Red filled portion up to current step
    fill_to = (current_step - 1) / 3 if current_step > 1 else 0
    if fill_to > 0:
        add_line(slide, left_pad, y, left_pad + Emu(int(track_w * fill_to)), y, color=RED, width=2.0)

    # Dots + labels
    steps = [
        ("AUG 2025", "THE PILOT", "1,000+ tickets · Ford"),
        ("OCT 2025", "THE ALBUM", "30K listens · wk one"),
        ("JAN 2026", "THE AWAKENING", "1,400+ submissions"),
        ("JUN 2027", "THE SHOW", "opens · 18-mo run"),
    ]
    for i, (when, name, stat) in enumerate(steps):
        x = left_pad + Emu(int(track_w * i / 3))
        is_active = (i + 1) == current_step
        # Dot
        dot_size = Inches(0.18) if is_active else Inches(0.14)
        dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, x - dot_size / 2, y - dot_size / 2, dot_size, dot_size)
        dot.fill.solid()
        dot.fill.fore_color.rgb = RED if (i + 1) <= current_step else INK
        dot.line.color.rgb = RED
        dot.line.width = Pt(1.5)
        # Label group
        lx = x - Inches(1.1)
        add_text(slide, lx, y + Inches(0.18), Inches(2.2), Inches(0.18),
                 when, font=F_MONO, size=8,
                 color=RED if is_active else WHITE_DIM,
                 align="center", letter_spacing=160)
        add_text(slide, lx, y + Inches(0.36), Inches(2.2), Inches(0.24),
                 name, font=F_DISPLAY, size=11,
                 color=RED if is_active else WHITE,
                 align="center", bold=True, letter_spacing=120)
        add_text(slide, lx, y + Inches(0.60), Inches(2.2), Inches(0.2),
                 stat, font=F_SERIF, size=9, italic=True,
                 color=WHITE_DIM, align="center")


def add_chrome(slide, slide_num, total, chapter):
    """Bottom chrome with chapter label and counter."""
    add_text(slide, Inches(0.3), SLIDE_H - Inches(0.34), Inches(8), Inches(0.22),
             f"{slide_num:02d} · {chapter.upper()}",
             font=F_MONO, size=8, color=WHITE_DIM, letter_spacing=120)
    add_text(slide, SLIDE_W - Inches(1.5), SLIDE_H - Inches(0.34), Inches(1.2), Inches(0.22),
             f"{slide_num:02d} / {total:02d}",
             font=F_MONO, size=8, color=WHITE_DIM, align="right", letter_spacing=120)


# ----- SLIDES ------------------------------------------------------------

TOTAL = 19

def slide_01_cover(prs):
    s = blank_slide(prs, INK)
    # Photo as background (the crowd photo, full bleed, dimmed)
    add_image(s, os.path.join(ASSETS, "crowd.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    # Dimming overlay
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    # set transparency to 40%
    from lxml import etree
    fillpr = overlay.fill._xPr
    sf = fillpr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        if srgb is not None:
            alpha = etree.SubElement(srgb, qn("a:alpha"))
            alpha.set("val", "60000")  # 60% opaque (40% transparent)
    overlay.line.fill.background()

    # Top meta row
    add_text(s, Inches(0.5), Inches(0.4), Inches(3), Inches(0.3),
             "PITCH 2026", font=F_MONO, size=10, color=WHITE, letter_spacing=180)
    add_text(s, Inches(7), Inches(0.4), Inches(6), Inches(0.3),
             "AN IMMERSIVE THEATRICAL TOUR OF THE REAL LOS ANGELES",
             font=F_MONO, size=10, color=WHITE, letter_spacing=180, align="right")

    # Title — two red banner blocks
    add_pill_rect(s, Inches(0.7), Inches(2.55), Inches(8.4), Inches(1.45),
                  fill=RED, text="IF I AWAKEN IN",
                  font=F_DISPLAY, size=80, color=WHITE, bold=True)
    add_pill_rect(s, Inches(0.7), Inches(4.10), Inches(7.4), Inches(1.45),
                  fill=RED, text="LOS ANGELES",
                  font=F_DISPLAY, size=80, color=WHITE, bold=True)

    # Bottom row
    # red dot
    dot = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.5), Inches(6.7), Inches(0.16), Inches(0.16))
    dot.fill.solid(); dot.fill.fore_color.rgb = RED; dot.line.fill.background()
    add_text(s, Inches(0.75), Inches(6.66), Inches(7), Inches(0.25),
             "OPENING JUNE 2027 · ARTS DISTRICT · LOS ANGELES",
             font=F_MONO, size=10, color=WHITE, letter_spacing=180)
    add_text(s, SLIDE_W - Inches(2.2), Inches(6.66), Inches(2), Inches(0.25),
             "SCROLL TO BEGIN ↓",
             font=F_MONO, size=10, color=WHITE_MUTE, letter_spacing=180, align="right")
    add_chrome(s, 1, TOTAL, "Cover")
    return s


def slide_02_hook(prs):
    s = blank_slide(prs, INK)
    add_image(s, os.path.join(ASSETS, "cover.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    from lxml import etree
    sf = overlay.fill._xPr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        alpha = etree.SubElement(srgb, qn("a:alpha"))
        alpha.set("val", "70000")
    overlay.line.fill.background()

    # Lede 1
    add_text(s, Inches(0.7), Inches(0.9), Inches(10), Inches(0.6),
             "An iconic American city without an iconic show. That must-see experience you just have to see when you're in town.",
             font=F_SERIF, size=18, italic=True, color=WHITE_MUTE, line_spacing=1.3)

    # H2 title
    add_paragraphs(s, Inches(0.7), Inches(1.9), Inches(11), Inches(2.5), [
        {"text": "This is the show ", "font": F_TIGHT, "size": 60, "color": RED, "bold": True},
    ])
    # second line below
    add_text(s, Inches(0.7), Inches(2.85), Inches(11), Inches(1.0),
             "Los Angeles has been missing.",
             font=F_TIGHT, size=60, color=WHITE, bold=True, line_spacing=1.0)

    # Lede 2
    add_text(s, Inches(0.7), Inches(4.4), Inches(10), Inches(0.6),
             "Unlike anything that's come before, and unlike anything you'll see again.",
             font=F_SERIF, size=18, italic=True, color=WHITE_MUTE, line_spacing=1.3)

    # Sub
    add_text(s, Inches(0.7), Inches(5.1), Inches(10), Inches(0.5),
             "But first, let me catch you up on what If I Awaken has accomplished so far…",
             font=F_SERIF, size=14, italic=True, color=WHITE_DIM)

    # Story track (4 dots + names)
    track_y = Inches(6.0)
    add_line(s, Inches(0.7), track_y, SLIDE_W - Inches(0.7), track_y, color=RED, width=1.5)
    step_names = ["THE PILOT", "THE ALBUM", "THE AWAKENING", "THE SHOW"]
    for i, name in enumerate(step_names):
        x_center = Inches(0.7) + Emu(int((SLIDE_W - Inches(1.4)) * i / 3))
        dot_size = Inches(0.16)
        dot = s.shapes.add_shape(MSO_SHAPE.OVAL, x_center - dot_size/2, track_y - dot_size/2, dot_size, dot_size)
        dot.fill.solid(); dot.fill.fore_color.rgb = RED; dot.line.fill.background()
        add_text(s, x_center - Inches(1.2), track_y + Inches(0.18), Inches(2.4), Inches(0.25),
                 name, font=F_DISPLAY, size=12, color=WHITE, align="center",
                 letter_spacing=120, bold=True)

    add_chrome(s, 2, TOTAL, "The Hook")
    return s


def slide_03_pilot(prs):
    s = blank_slide(prs, INK)
    add_timeline(s, current_step=1)

    # Left column
    add_eyebrow(s, Inches(0.6), Inches(1.85), "CHAPTER ONE · AUGUST 2025")
    add_text(s, Inches(0.6), Inches(2.3), Inches(6), Inches(1.3),
             "THE PILOT.", font=F_DISPLAY, size=72, color=WHITE, bold=True, line_spacing=1.0,
             letter_spacing=-15)
    add_text(s, Inches(0.6), Inches(3.5), Inches(6.2), Inches(0.7),
             "If I Awaken in Los Angeles premiered at LA's iconic Ford Theatre, in partnership with the LA Philharmonic.",
             font=F_SERIF, size=15, italic=True, color=WHITE, line_spacing=1.35)
    add_paragraphs(s, Inches(0.6), Inches(4.3), Inches(6.2), Inches(1.4), [
        {"text": "Directed by Gina Belafonte, with musical direction from multiple Grammy Award–winning composer Derrick Hodge. The show premiered to a sold-out house — with lines so long the show started thirty minutes late to accommodate the crowd trying to get in.",
         "size": 12, "color": WHITE_MUTE, "line_spacing": 1.45}
    ])

    # Big stat
    add_text(s, Inches(0.6), Inches(5.7), Inches(4), Inches(0.95),
             "1,000+", font=F_DISPLAY, size=64, color=RED, bold=True, letter_spacing=-20)
    add_text(s, Inches(0.6), Inches(6.55), Inches(4), Inches(0.25),
             "TICKETS SOLD", font=F_MONO, size=10, color=WHITE_MUTE, letter_spacing=160)

    # Right column — photo
    add_image(s, os.path.join(ASSETS, "oscar.jpg"), Inches(7), Inches(1.85), Inches(5.6), Inches(2.4))

    # Cast list
    cast_y = Inches(4.45)
    add_text(s, Inches(7), cast_y, Inches(5.6), Inches(0.25),
             "FEATURED ON STAGE", font=F_MONO, size=10, color=RED, letter_spacing=160)
    add_line(s, Inches(7), cast_y + Inches(0.35), Inches(12.6), cast_y + Inches(0.35), color=RULE_DARK, width=0.5)
    cast = [
        ("LUIS J. RODRIGUEZ", "Former LA Poet Laureate"),
        ("SAMANTHA RIOS", "Current LA Youth Poet Laureate"),
        ("DANTE BASCO", "Hook · Avatar: The Last Airbender"),
        ("MENDELEYEV", "NBC's The Voice"),
    ]
    for i, (name, role) in enumerate(cast):
        y = cast_y + Inches(0.45) + Inches(0.30 * i)
        add_text(s, Inches(7), y, Inches(2.6), Inches(0.25), name,
                 font=F_DISPLAY, size=10, color=WHITE, bold=True, letter_spacing=100)
        add_text(s, Inches(9.7), y, Inches(2.9), Inches(0.25), role,
                 font=F_SERIF, size=10, italic=True, color=WHITE_MUTE)

    # Red pullquote banner at bottom
    add_pill_rect(s, Inches(0.6), Inches(7.05), Inches(12), Inches(0.36), fill=RED,
                  text='" They didn\'t just speak about Los Angeles — they spoke as Los Angeles. "',
                  font=F_DISPLAY, size=14, color=WHITE, bold=True, align="left")

    add_chrome(s, 3, TOTAL, "The Pilot")
    return s


def slide_04_album(prs):
    s = blank_slide(prs, INK)
    add_timeline(s, current_step=2)

    # Left column
    add_eyebrow(s, Inches(0.6), Inches(1.85), "CHAPTER TWO · FIRST WEEK")
    add_text(s, Inches(0.6), Inches(2.3), Inches(6), Inches(1.3),
             "THE ALBUM.", font=F_DISPLAY, size=72, color=WHITE, bold=True, line_spacing=1.0,
             letter_spacing=-15)
    add_inline_text(s, Inches(0.6), Inches(3.5), Inches(6.2), Inches(0.6), [
        {"text": "Demand didn't stop at the stage. ", "font": F_SERIF, "size": 15, "color": WHITE, "italic": True},
        {"text": "It surged.", "font": F_SERIF, "size": 15, "color": RED, "italic": True},
    ], line_spacing=1.3)
    add_text(s, Inches(0.6), Inches(4.3), Inches(6.2), Inches(1.0),
             "2× Grammy-winning composer Derrick Hodge partnered with iconic LA voices — Jackson Browne, Cheech Marin, and Joy Harjo — to expand the show's impact far beyond the theater.",
             font=F_BODY, size=12, color=WHITE_MUTE, line_spacing=1.45)

    # Big stat
    add_text(s, Inches(0.6), Inches(5.5), Inches(4), Inches(0.95),
             "30K+", font=F_DISPLAY, size=64, color=RED, bold=True, letter_spacing=-20)
    add_text(s, Inches(0.6), Inches(6.35), Inches(4), Inches(0.25),
             "LISTENS · FIRST WEEK", font=F_MONO, size=10, color=WHITE_MUTE, letter_spacing=160)

    # Streaming links — 3 pill buttons
    btn_y = Inches(6.75)
    btns = ["▶ SPOTIFY", "♪ APPLE MUSIC", "▶ YOUTUBE MUSIC"]
    for i, label in enumerate(btns):
        bx = Inches(0.6) + Inches(2.0 * i)
        btn = add_rect(s, bx, btn_y, Inches(1.85), Inches(0.32), fill=None, line=RGBColor(0x55, 0x55, 0x55), line_width=0.5)
        tf = btn.text_frame
        tf.margin_left = Inches(0.05); tf.margin_right = Inches(0.05)
        tf.margin_top = 0; tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run(); r.text = label
        r.font.name = F_MONO; r.font.size = Pt(9); r.font.color.rgb = WHITE
        rPr = r._r.get_or_add_rPr(); rPr.set("spc", "140")

    # Right column — album cover (simplified: a gradient-like rectangle with photo inside)
    cover_left = Inches(7); cover_top = Inches(1.85); cover_w = Inches(3.0); cover_h = Inches(3.0)
    bg = add_rect(s, cover_left, cover_top, cover_w, cover_h, fill=RGBColor(0x1A, 0x28, 0x40))
    bg.line.color.rgb = RED; bg.line.width = Pt(3)
    # Add small mark
    add_text(s, cover_left + Inches(0.15), cover_top + Inches(0.15), cover_w - Inches(0.3), Inches(0.3),
             "IF I AWAKEN IN LOS ANGELES",
             font=F_DISPLAY, size=10, color=WHITE, bold=True, letter_spacing=60)
    # Inset photo
    add_image(s, os.path.join(ASSETS, "canyon.jpg"), cover_left + Inches(0.2),
              cover_top + Inches(0.55), cover_w - Inches(0.4), cover_h - Inches(0.75))

    # Voices block (right column, below album)
    voices_left = Inches(10.4); voices_top = Inches(1.85)
    add_text(s, voices_left, voices_top, Inches(2.5), Inches(0.25),
             "ADDED ICONIC LA VOICES", font=F_MONO, size=9, color=RED, letter_spacing=160)
    add_line(s, voices_left, voices_top + Inches(0.32), voices_left + Inches(2.3), voices_top + Inches(0.32), color=RULE_DARK, width=0.5)
    voices = [("5", "Grammy winning &\nnominated artists"),
              ("3", "U.S. Poet Laureates"),
              ("2×", "Library of Congress–\nwinning team"),
              ("1", "Rock & Roll Hall\nof Fame inductee")]
    for i, (n, label) in enumerate(voices):
        y = voices_top + Inches(0.45 + i * 0.85)
        add_text(s, voices_left, y, Inches(0.6), Inches(0.5), n,
                 font=F_TIGHT, size=22, color=RED, bold=True, letter_spacing=-15)
        add_text(s, voices_left + Inches(0.7), y + Inches(0.08), Inches(1.7), Inches(0.6), label,
                 font=F_BODY, size=10, color=WHITE, line_spacing=1.2)

    add_chrome(s, 4, TOTAL, "The Album")
    return s


def slide_05_awakening(prs):
    s = blank_slide(prs, INK)
    add_timeline(s, current_step=3)

    # Left
    add_eyebrow(s, Inches(0.6), Inches(1.85), "CHAPTER THREE · THE CITY ANSWERED")
    add_text(s, Inches(0.6), Inches(2.3), Inches(6), Inches(1.3),
             "THE AWAKENING.", font=F_DISPLAY, size=64, color=WHITE, bold=True, line_spacing=1.0,
             letter_spacing=-15)
    add_text(s, Inches(0.6), Inches(3.55), Inches(6.2), Inches(0.45),
             "Then the entire city got involved.",
             font=F_SERIF, size=16, italic=True, color=WHITE, line_spacing=1.3)
    add_inline_text(s, Inches(0.6), Inches(4.1), Inches(6.5), Inches(0.7), [
        {"text": "We inadvertently kick-started the ", "size": 12, "color": WHITE_MUTE},
        {"text": "largest poetry competition in the country", "size": 12, "color": RED, "bold": True},
        {"text": " by asking one question:", "size": 12, "color": WHITE_MUTE},
    ], line_spacing=1.4)
    add_text(s, Inches(0.6), Inches(4.8), Inches(6.2), Inches(0.5),
             "Tell us about your LA.",
             font=F_SERIF, size=22, italic=True, color=WHITE)
    add_text(s, Inches(0.6), Inches(5.4), Inches(6.5), Inches(0.7),
             "Partnering with the LA Unified School District and Get Lit – Words Ignite, students, teachers, classrooms, and community centers across LA added their voice.",
             font=F_BODY, size=11, color=WHITE_MUTE, line_spacing=1.4)
    add_text(s, Inches(0.6), Inches(6.25), Inches(4), Inches(0.95),
             "1,400+", font=F_DISPLAY, size=64, color=RED, bold=True, letter_spacing=-20)
    add_text(s, Inches(0.6), Inches(7.1), Inches(4), Inches(0.22),
             "VIDEO SUBMISSIONS", font=F_MONO, size=9, color=WHITE_MUTE, letter_spacing=160)

    # Right — judges list
    j_left = Inches(7.4); j_top = Inches(1.85)
    add_text(s, j_left, j_top, Inches(5), Inches(0.25),
             "JUDGED BY", font=F_MONO, size=10, color=RED, letter_spacing=160)
    add_line(s, j_left, j_top + Inches(0.32), Inches(12.6), j_top + Inches(0.32), color=RULE_DARK, width=0.5)
    judges = [
        ("ALOE BLACC", "Grammy-nominated singer-songwriter"),
        ("GINA BELAFONTE", "Producer · co-founder, Sankofa.org"),
        ("SAFIA ELHILLO", "Sudanese-American poet · Ruth Lilly Fellow"),
        ("JOSÉ OLIVAREZ", "NYT bestselling author, Promises of Gold"),
        ("CHEN CHEN", "Poet"),
        ("OLIVIA GATWOOD", "Poet & novelist · Life of the Party"),
    ]
    for i, (name, bio) in enumerate(judges):
        y = j_top + Inches(0.5) + Inches(0.4 * i)
        add_text(s, j_left, y, Inches(2.0), Inches(0.25), name,
                 font=F_DISPLAY, size=10, color=WHITE, bold=True, letter_spacing=100)
        add_text(s, j_left + Inches(2.1), y, Inches(3.5), Inches(0.4), bio,
                 font=F_SERIF, size=10, italic=True, color=WHITE_MUTE, line_spacing=1.25)

    add_chrome(s, 5, TOTAL, "The Awakening")
    return s


def slide_06_show(prs):
    s = blank_slide(prs, INK)
    add_image(s, os.path.join(ASSETS, "finale.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    from lxml import etree
    sf = overlay.fill._xPr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        alpha = etree.SubElement(srgb, qn("a:alpha"))
        alpha.set("val", "62000")
    overlay.line.fill.background()
    add_timeline(s, current_step=4)

    add_eyebrow(s, Inches(0.6), Inches(1.9), "THE SIGNAL IS CLEAR. THE DEMAND IS VERIFIED.")
    add_paragraphs(s, Inches(0.6), Inches(2.45), Inches(11), Inches(1.4), [
        {"text": "This is the show ", "font": F_SERIF, "size": 50, "color": RED, "italic": True},
    ])
    add_text(s, Inches(0.6), Inches(3.2), Inches(11), Inches(1.0),
             "Los Angeles has been missing.",
             font=F_SERIF, size=50, italic=True, color=WHITE, line_spacing=1.0)

    add_text(s, Inches(0.6), Inches(4.4), Inches(11), Inches(0.4),
             "Three chapters in, the city's verdict was unambiguous — and the press said it back.",
             font=F_SERIF, size=14, italic=True, color=WHITE_MUTE)

    # 3 quotes
    quotes = [
        ('"A rich, moving experience. The poetry, dance, and film came together beautifully."', "— Jodie Foster & Alex Hedison"),
        ('"A powerful celebration of LA\'s diversity and resilience. Unforgettable."', "— Reina Pereira"),
        ('"Brilliant storytelling. A groundbreaking approach to history, modernity, place, and people. This show changes everything."', "— Aloe Blacc"),
    ]
    q_y = Inches(5.0)
    q_w = Inches(4.0)
    q_gap = Inches(0.15)
    q_total_w = q_w * 3 + q_gap * 2
    q_x_start = (SLIDE_W - q_total_w) / 2
    for i, (q, c) in enumerate(quotes):
        x = q_x_start + (q_w + q_gap) * i
        # box bg
        box = add_rect(s, x, q_y, q_w, Inches(1.85), fill=RGBColor(0x00, 0x00, 0x00))
        from lxml import etree
        sf = box.fill._xPr.find(qn("a:solidFill"))
        if sf is not None:
            srgb = sf.find(qn("a:srgbClr"))
            alpha = etree.SubElement(srgb, qn("a:alpha"))
            alpha.set("val", "55000")
        # red left border (separate thin rect)
        add_rect(s, x, q_y, Inches(0.04), Inches(1.85), fill=RED)
        add_text(s, x + Inches(0.2), q_y + Inches(0.15), q_w - Inches(0.3), Inches(1.4),
                 q, font=F_TIGHT, size=11, color=WHITE, line_spacing=1.4)
        add_text(s, x + Inches(0.2), q_y + Inches(1.55), q_w - Inches(0.3), Inches(0.25),
                 c, font=F_MONO, size=8, color=WHITE_MUTE, letter_spacing=140)

    add_chrome(s, 6, TOTAL, "The Show")
    return s


def slide_07_experience(prs):
    s = blank_slide(prs, INK)
    add_image(s, os.path.join(ASSETS, "venue.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    from lxml import etree
    sf = overlay.fill._xPr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        alpha = etree.SubElement(srgb, qn("a:alpha"))
        alpha.set("val", "55000")
    overlay.line.fill.background()

    add_eyebrow(s, Inches(0.6), Inches(1.5),
                "AN IMMERSIVE THEATRE EXPERIENCE · LOS ANGELES · 2027", color=WHITE)
    add_text(s, Inches(0.6), Inches(2.2), Inches(12), Inches(1.5),
             "If I Awaken in Los Angeles.",
             font=F_SERIF, size=68, italic=True, color=GOLD, line_spacing=1.0,
             letter_spacing=-20)

    # Lede
    add_inline_text(s, Inches(0.6), Inches(4.0), Inches(12), Inches(2), [
        {"text": "A ", "size": 18, "color": WHITE},
        {"text": "90-minute immersive theatrical experience", "size": 18, "color": RED, "bold": True},
        {"text": " that walks guests through the real Los Angeles — captured inside a ", "size": 18, "color": WHITE},
        {"text": "30,000-sq-ft converted studio", "size": 18, "color": RED, "bold": True},
        {"text": " in the Arts District, next to the iconic 6th Street Bridge.", "size": 18, "color": WHITE},
    ], line_spacing=1.4)

    add_text(s, Inches(0.6), Inches(6.2), Inches(11), Inches(0.8),
             "An LA recreated and reimagined. Guests are guided through built sets and live performances spanning every neighborhood and culture that makes the city what it is.",
             font=F_BODY, size=13, color=WHITE_MUTE, line_spacing=1.45)

    add_chrome(s, 7, TOTAL, "The Experience")
    return s


def slide_08_journey(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "THE WALK")
    add_text(s, Inches(0.6), Inches(0.95), Inches(11), Inches(0.9),
             "Seven neighborhoods, one continuous walk.",
             font=F_SERIF, size=40, italic=True, color=GOLD, line_spacing=1.0, letter_spacing=-15)
    add_text(s, Inches(0.6), Inches(1.85), Inches(11), Inches(0.35),
             "From the red carpet to the real LA. No seats until the finale.",
             font=F_SERIF, size=14, italic=True, color=WHITE_MUTE)

    # 7 cards in 2 rows (4 + 3)
    cards = [
        ("01", "HOLLYWOOD BOULEVARD", "A 110-foot LED wall. Dancers as tourists. The Walk of Fame underfoot. The wall pivots — and the tour breaks open.", "red-carpet.jpg"),
        ("02", "BOYLE HEIGHTS", "A tianguis with stone tables and a band stage where two poets meet across a generation.", "journey-2.jpg"),
        ("03", "THE ASIAN ARC", "Chinatown · Little Tokyo · Koreatown · Filipinotown · Thai Town. One rapper-poet walking the line.", "journey-3.jpg"),
        ("04", "BLACK LA · A CENTURY", "A church wall opens — gospel choir, swing dance at Dunbar, hip-hop cypher, Leimert Park drum circle.", "journey-4.jpg"),
        ("05", "FOLK LA · LAUREL CANYON", "A knock at a door becomes a living room. The band joins the audience on the floor.", "journey-5.jpg"),
        ("06", "THE STAGE", "A classical proscenium. The only seated room. A finale that earns its formality.", "journey-6.jpg"),
        ("07", "THE REAL LA", "Back through the corridor we entered — but this time the wall is made of the audience's own faces.", "journey-7.jpg"),
    ]
    # Card grid: 4 cols × 2 rows
    card_w = Inches(3.0); card_h = Inches(2.6)
    margin_x = Inches(0.6); gap = Inches(0.08)
    start_x = margin_x; start_y = Inches(2.4)

    for i, (num, name, desc, photo) in enumerate(cards):
        col = i % 4; row = i // 4
        x = start_x + (card_w + gap) * col
        y = start_y + (card_h + gap + Inches(0.15)) * row
        # photo on top
        try:
            add_image(s, os.path.join(ASSETS, photo), x, y, card_w, Inches(1.45))
        except Exception:
            add_rect(s, x, y, card_w, Inches(1.45), fill=RULE_DARK)
        # text area below
        add_rect(s, x, y + Inches(1.45), card_w, Inches(1.15), fill=RGBColor(0x14, 0x14, 0x14), line=RULE_DARK, line_width=0.5)
        add_text(s, x + Inches(0.15), y + Inches(1.52), card_w - Inches(0.3), Inches(0.2),
                 num, font=F_MONO, size=8, color=RED, letter_spacing=160)
        add_text(s, x + Inches(0.15), y + Inches(1.72), card_w - Inches(0.3), Inches(0.3),
                 name, font=F_DISPLAY, size=11, color=WHITE, bold=True, letter_spacing=80)
        add_text(s, x + Inches(0.15), y + Inches(2.02), card_w - Inches(0.3), Inches(0.55),
                 desc, font=F_BODY, size=9, color=WHITE_MUTE, line_spacing=1.35)

    add_chrome(s, 8, TOTAL, "The Journey")
    return s


def slide_09_building(prs):
    s = blank_slide(prs, INK)
    add_text(s, Inches(0.6), Inches(0.5), Inches(4), Inches(0.3),
             "WHAT WE ARE BUILDING", font=F_MONO, size=10, color=GREEN, letter_spacing=160)
    add_line(s, Inches(0.6), Inches(0.8), Inches(3.4), Inches(0.8), color=GREEN, width=1)
    add_text(s, Inches(0.6), Inches(1.0), Inches(11), Inches(1.2),
             "A single, continuous, 100-minute room.",
             font=F_SERIF, size=44, italic=True, color=GOLD, line_spacing=1.0, letter_spacing=-15)

    # 6-cell grid
    cells = [
        ("SQ FT", "30.1K", "WAREHOUSE FOOTPRINT", "ARTS DISTRICT, LOS ANGELES"),
        ("GUESTS", "150", "PER SHOW", "WALKING, IMMERSIVE,\nSINGLE-DIRECTION LOOP"),
        ("MINS", "100", "RUN TIME", "SEVEN SPACES\nONE CONTINUOUS ARC"),
        ("SHOWS", "12", "PER WEEK", "TUESDAY THROUGH SUNDAY"),
        ("MONTH", "14+", "PROD. RUN", "JUNE 2027 — AUGUST 2028"),
        ("STAGES", "7", "BUILT ENVIRONMENTS", "+LOBBY THAT DOUBLES\nAS THEATRE"),
    ]
    cw = Inches(3.95); ch = Inches(2.45); gap = Inches(0.15)
    sx = Inches(0.6); sy = Inches(2.3)
    for i, (meta, num, label, sub) in enumerate(cells):
        col = i % 3; row = i // 3
        x = sx + (cw + gap) * col; y = sy + (ch + gap) * row
        add_rect(s, x, y, cw, ch, fill=RGBColor(0x13, 0x13, 0x13), line=RULE_DARK, line_width=0.5)
        add_text(s, x + cw - Inches(1.3), y + Inches(0.2), Inches(1.1), Inches(0.2),
                 meta, font=F_MONO, size=9, color=WHITE_DIM, letter_spacing=180, align="right")
        add_text(s, x + Inches(0.3), y + Inches(0.5), cw - Inches(0.6), Inches(1.0),
                 num, font=F_DISPLAY, size=52, color=RED, bold=True, letter_spacing=-20)
        add_text(s, x + Inches(0.3), y + Inches(1.55), cw - Inches(0.6), Inches(0.3),
                 label, font=F_DISPLAY, size=11, color=WHITE, bold=True, letter_spacing=180)
        add_text(s, x + Inches(0.3), y + Inches(1.85), cw - Inches(0.6), Inches(0.5),
                 sub, font=F_SERIF, size=10, italic=True, color=WHITE_DIM, line_spacing=1.3)

    add_chrome(s, 9, TOTAL, "What We're Building")
    return s


def slide_10_team(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "THE TEAM")
    add_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.85),
             "The credentials behind building the room — and representing the city.",
             font=F_TIGHT, size=30, color=WHITE, bold=True, line_spacing=1.0, letter_spacing=-15)

    # Two pillar boxes
    p_w = Inches(6.0); p_h = Inches(1.6); p_y = Inches(2.0); gap = Inches(0.3)
    p_total = p_w * 2 + gap
    p_x_start = (SLIDE_W - p_total) / 2
    # Pillar 1
    p1 = add_rect(s, p_x_start, p_y, p_w, p_h, fill=RGBColor(0x14, 0x14, 0x14))
    add_rect(s, p_x_start, p_y, Inches(0.05), p_h, fill=RED)
    add_text(s, p_x_start + Inches(0.25), p_y + Inches(0.2), p_w - Inches(0.4), Inches(0.25),
             "TO BUILD AT THIS SCALE", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_inline_text(s, p_x_start + Inches(0.25), p_y + Inches(0.55), p_w - Inches(0.4), Inches(1.0), [
        {"text": "From ", "size": 11, "color": WHITE},
        {"text": "Tony Award–winning ", "size": 11, "color": WHITE, "bold": True},
        {"text": "producers, ", "size": 11, "color": WHITE},
        {"text": "Grammy-winning ", "size": 11, "color": WHITE, "bold": True},
        {"text": "music, Broadway immersive theatre, Coachella, Stagecoach, the Grammys, the Super Bowl, and the White House — we have the team to ", "size": 11, "color": WHITE},
        {"text": "handle the scale.", "size": 11, "color": RED, "bold": True},
    ], line_spacing=1.4)
    # Pillar 2
    p2_x = p_x_start + p_w + gap
    p2 = add_rect(s, p2_x, p_y, p_w, p_h, fill=RGBColor(0x14, 0x14, 0x14))
    add_rect(s, p2_x, p_y, Inches(0.05), p_h, fill=RED)
    add_text(s, p2_x + Inches(0.25), p_y + Inches(0.2), p_w - Inches(0.4), Inches(0.25),
             "TO REPRESENT LOS ANGELES", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_inline_text(s, p2_x + Inches(0.25), p_y + Inches(0.55), p_w - Inches(0.4), Inches(1.0), [
        {"text": "With ", "size": 11, "color": WHITE},
        {"text": "two decades of LA community trust, LAUSD-approved programs, ", "size": 11, "color": WHITE, "bold": True},
        {"text": "the country's ", "size": 11, "color": WHITE},
        {"text": "largest live spoken-word events, ", "size": 11, "color": WHITE, "bold": True},
        {"text": "and ", "size": 11, "color": WHITE},
        {"text": "multi-stage festival production ", "size": 11, "color": WHITE, "bold": True},
        {"text": "— we have the team to ", "size": 11, "color": WHITE},
        {"text": "represent Los Angeles.", "size": 11, "color": RED, "bold": True},
    ], line_spacing=1.4)

    # 9-card grid (3 cols × 3 rows)
    team = [
        ("ANDREW SCOVILLE", "DIRECTOR", "Director, Theater of the Mind (David Byrne). Assoc dir, Broadway's Here Lies Love. Director, Netflix's Money Heist: The Experience.", True),
        ("DERRICK HODGE", "COMPOSER · 2× GRAMMY", "Wrote the Ford pilot. Continues to shape the show's musical language through the album and the run.", False),
        ("DIANE LUBY LANE", "CREATOR & LEAD PRODUCER", "Founder & CEO of Get Lit – Words Ignite (200+ schools). Patterson Award. Presidential Lifetime Volunteer.", False),
        ("SHANE SNOW", "PRODUCER · TONY", "Tony Award–winning producer. Bestselling author. Pulitzer Prize entrant for journalism.", False),
        ("ROB O'NEILL", "PRODUCER · TONY", "Tony winner as co-producer of The Outsiders (Broadway 2024). Co-prod, The Who's Tommy, Burlesque.", False),
        ("GINA BELAFONTE", "PRODUCER · DIRECTED PILOT", "Award-winning producer, director, activist. Co-founder & E.D., Sankofa.org.", False),
        ("BRANDON XIV", "LEAD PRODUCER", "Co-founder of SHOWRUNNER. Award-winning across film, tech, and the seam between.", False),
        ("MARK CHINAPEN", "GENERAL MANAGER", "Multi-stage ops for Coachella and Stagecoach. Custom staging for the Grammys and World of Dance.", False),
        ("MONIQUE MITCHELL", "PRODUCER", "Global campaigns (Puma, Lexus, Fox), A24, NY Times. Helped pass CA SB 933 — $50M for arts ed.", False),
    ]
    cw = Inches(4.0); ch = Inches(1.15); gap = Inches(0.15)
    sx = (SLIDE_W - cw * 3 - gap * 2) / 2
    sy = Inches(3.9)
    for i, (name, role, bio, highlight) in enumerate(team):
        col = i % 3; row = i // 3
        x = sx + (cw + gap) * col; y = sy + (ch + gap) * row
        top_color = RED if highlight else RULE_DARK
        add_line(s, x, y, x + cw, y, color=top_color, width=1.5 if highlight else 0.5)
        add_text(s, x, y + Inches(0.1), cw, Inches(0.3),
                 name, font=F_DISPLAY, size=11, color=WHITE, bold=True, letter_spacing=80)
        add_text(s, x, y + Inches(0.36), cw, Inches(0.2),
                 role, font=F_MONO, size=8, color=RED, letter_spacing=160)
        add_text(s, x, y + Inches(0.6), cw, Inches(0.55),
                 bio, font=F_BODY, size=9, color=WHITE_MUTE, line_spacing=1.35)

    add_chrome(s, 10, TOTAL, "The Team")
    return s


def slide_11_market_cities(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "MARKET OPPORTUNITY · COMPARABLES")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.9), [
        {"text": "This is the show ", "font": F_TIGHT, "size": 36, "color": RED, "bold": True},
        {"text": "Los Angeles has been missing.", "font": F_TIGHT, "size": 36, "color": WHITE, "bold": True},
    ], line_spacing=1.05)
    add_text(s, Inches(0.6), Inches(2.05), Inches(12), Inches(0.5),
             "Every great cultural capital has its iconic live experience — the must-see, the staple, the show built for that city. Here's what those shows are worth in their markets:",
             font=F_SERIF, size=12, italic=True, color=WHITE_MUTE, line_spacing=1.4)

    # 6 cards in 3 cols × 2 rows
    cards = [
        ("NEW YORK CITY", "Sleep No More", "2M+", "total visitors", "$200M+", "lifetime ticket gross", False),
        ("LAS VEGAS", "Meow Wolf", "3M", "annual visitors", "$300M+", "raised · scaled from $9.2M single location to a national platform", False),
        ("NASHVILLE", "Grand Ole Opry", "250K+", "annual visitors", "$15M", "annual revenue", False),
        ("LONDON", "Secret Cinema", "1M+", "tickets sold", "$100M+", "acquisition", False),
        ("PARIS", "Moulin Rouge", "600K", "annual guests", "$68M", "annual revenue", False),
        ("LOS ANGELES", "If I Awaken in Los Angeles", "—", "opens June 2027", "$9.5M", "raise · chapter one", True),
    ]
    cw = Inches(4.05); ch = Inches(2.05); gap = Inches(0.15)
    sx = Inches(0.6); sy = Inches(2.85)
    for i, (city, show, n1, l1, n2, l2, is_us) in enumerate(cards):
        col = i % 3; row = i // 3
        x = sx + (cw + gap) * col; y = sy + (ch + gap) * row
        bg = RGBColor(0x2A, 0x10, 0x12) if is_us else RGBColor(0x11, 0x11, 0x11)
        border = RED if is_us else RULE_DARK
        add_rect(s, x, y, cw, ch, fill=bg, line=border, line_width=1.5 if is_us else 0.5)
        add_text(s, x + Inches(0.2), y + Inches(0.15), cw - Inches(0.4), Inches(0.25),
                 city, font=F_MONO, size=9, color=RED, letter_spacing=160)
        add_text(s, x + Inches(0.2), y + Inches(0.4), cw - Inches(0.4), Inches(0.35),
                 show, font=F_DISPLAY if not is_us else F_SERIF,
                 size=15, color=WHITE, bold=True, italic=is_us, letter_spacing=40)
        add_line(s, x + Inches(0.2), y + Inches(0.85), x + cw - Inches(0.2), y + Inches(0.85), color=RULE_DARK, width=0.5)
        add_text(s, x + Inches(0.2), y + Inches(0.95), Inches(1.4), Inches(0.4),
                 n1, font=F_TIGHT, size=18, color=RED, bold=True, letter_spacing=-15)
        add_text(s, x + Inches(0.2), y + Inches(1.35), cw - Inches(0.4), Inches(0.3),
                 l1, font=F_BODY, size=9, color=WHITE_MUTE)
        add_text(s, x + Inches(0.2), y + Inches(1.55), Inches(1.4), Inches(0.4),
                 n2, font=F_TIGHT, size=18, color=RED, bold=True, letter_spacing=-15)
        add_text(s, x + Inches(0.2), y + Inches(1.95), cw - Inches(0.4), Inches(0.35),
                 l2, font=F_BODY, size=9, color=WHITE_MUTE, line_spacing=1.3)

    add_chrome(s, 11, TOTAL, "Market · Comparables")
    return s


def slide_12_market_la(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "MARKET OPPORTUNITY · LOS ANGELES")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.9), [
        {"text": "The entertainment capital of the world — ", "font": F_TIGHT, "size": 30, "color": WHITE, "bold": True},
        {"text": "about to enter its global spotlight.", "font": F_TIGHT, "size": 30, "color": RED, "bold": True},
    ], line_spacing=1.05)
    add_inline_text(s, Inches(0.6), Inches(2.0), Inches(12), Inches(0.9), [
        {"text": "Greater Los Angeles is home to ", "size": 13, "color": WHITE},
        {"text": "18M+ people", "size": 13, "color": WHITE, "bold": True},
        {"text": ", nearly ", "size": 13, "color": WHITE},
        {"text": "50M annual visitors", "size": 13, "color": WHITE, "bold": True},
        {"text": ", with LA tourism generating ", "size": 13, "color": WHITE},
        {"text": "$40.4B annually", "size": 13, "color": WHITE, "bold": True},
        {"text": " in business sales — and currently has no defining live experience of its own.", "size": 13, "color": WHITE},
    ], line_spacing=1.4)

    # City table (LA highlighted)
    add_table(s, Inches(0.6), Inches(3.0), Inches(7.5), Inches(2.5),
              ["CITY", "RESIDENT MARKET", "ANNUAL VISITORS"],
              [
                  ["New York City", "20M–22M", "64M"],
                  ["Los Angeles", "18M+", "49M / nearly 50M"],
                  ["Paris", "12M–15M metro", "48.7M"],
                  ["Las Vegas", "2.3M+", "40M+"],
                  ["London", "9M / 15M metro", "~30M / 21M intl"],
                  ["Nashville", "2.2M+", "16.9M"],
              ],
              highlight_rows=[1])

    # Olympic box (right side)
    ob_x = Inches(8.4); ob_y = Inches(3.0); ob_w = Inches(4.3); ob_h = Inches(2.5)
    box = add_rect(s, ob_x, ob_y, ob_w, ob_h, fill=RGBColor(0x24, 0x0E, 0x10), line=RED, line_width=1.5)
    add_text(s, ob_x + Inches(0.25), ob_y + Inches(0.15), ob_w - Inches(0.5), Inches(0.25),
             "AND LA IS ABOUT TO BE ON THE BIGGEST STAGE",
             font=F_MONO, size=9, color=RED, letter_spacing=200)
    olympics_data = [
        ("15M", "additional visitors / spectators · 2028 Olympics"),
        ("5B", "global viewers"),
        ("$18B", "estimated economic impact"),
    ]
    for i, (n, l) in enumerate(olympics_data):
        y = ob_y + Inches(0.55 + i * 0.6)
        add_text(s, ob_x + Inches(0.25), y, Inches(1.3), Inches(0.45),
                 n, font=F_TIGHT, size=26, color=RED, bold=True, letter_spacing=-15)
        add_text(s, ob_x + Inches(1.55), y + Inches(0.1), ob_w - Inches(1.8), Inches(0.5),
                 l, font=F_BODY, size=10, color=WHITE, line_spacing=1.3)

    # Finale line
    add_inline_text(s, Inches(0.6), Inches(5.8), Inches(12.2), Inches(0.7), [
        {"text": "We have ", "font": F_TIGHT, "size": 22, "color": WHITE, "bold": True},
        {"text": "a show built for an Olympic moment.", "font": F_TIGHT, "size": 22, "color": RED, "bold": True},
    ], line_spacing=1.2)
    add_inline_text(s, Inches(0.6), Inches(6.5), Inches(12.2), Inches(0.7), [
        {"text": "In a ", "font": F_TIGHT, "size": 22, "color": WHITE, "bold": True},
        {"text": "once-in-a-generation window", "font": F_TIGHT, "size": 22, "color": RED, "bold": True},
        {"text": " of opportunity.", "font": F_TIGHT, "size": 22, "color": WHITE, "bold": True},
    ], line_spacing=1.2)

    add_chrome(s, 12, TOTAL, "Market · LA + Olympics")
    return s


def slide_13_market_franchise(prs):
    s = blank_slide(prs, INK)
    add_image(s, os.path.join(ASSETS, "stage.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    from lxml import etree
    sf = overlay.fill._xPr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        alpha = etree.SubElement(srgb, qn("a:alpha"))
        alpha.set("val", "62000")
    overlay.line.fill.background()

    add_eyebrow(s, Inches(0.6), Inches(0.5), "IF I AWAKEN… IN EVERY CITY")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.9), [
        {"text": "LA is chapter one of a ", "font": F_TIGHT, "size": 30, "color": WHITE, "bold": True},
        {"text": "replicable franchise.", "font": F_TIGHT, "size": 30, "color": RED, "bold": True},
    ], line_spacing=1.05)
    add_text(s, Inches(0.6), Inches(2.0), Inches(12), Inches(0.6),
             "The form travels because the form is honest: tell the truth about a place through the people who live there. Same architecture, new local cast, new revenue line — every city is a new chapter.",
             font=F_SERIF, size=12, italic=True, color=WHITE, line_spacing=1.4)

    # City table — all highlighted
    add_table(s, Inches(0.6), Inches(2.9), Inches(8), Inches(2.6),
              ["CITY", "RESIDENT MARKET", "ANNUAL VISITORS"],
              [
                  ["New York City", "20M–22M", "64M"],
                  ["Los Angeles", "18M+", "49M / nearly 50M"],
                  ["Paris", "12M–15M metro", "48.7M"],
                  ["Las Vegas", "2.3M+", "40M+"],
                  ["London", "9M / 15M metro", "~30M / 21M intl"],
                  ["Nashville", "2.2M+", "16.9M"],
              ],
              highlight_rows=[0, 1, 2, 3, 4, 5])

    # Chapters to come
    add_text(s, Inches(0.6), Inches(5.7), Inches(4), Inches(0.3),
             "CHAPTERS TO COME", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_line(s, Inches(0.6), Inches(6.0), SLIDE_W - Inches(0.6), Inches(6.0), color=RED, width=1)
    titles = [("If I Awaken in", "NEW YORK"), ("If I Awaken in", "CHICAGO"), ("If I Awaken in", "LONDON")]
    cw = Inches(4.0); gap = Inches(0.15)
    sx = (SLIDE_W - cw * 3 - gap * 2) / 2
    for i, (pre, city) in enumerate(titles):
        x = sx + (cw + gap) * i; y = Inches(6.2)
        add_rect(s, x, y, cw, Inches(0.85), fill=RGBColor(0x14, 0x14, 0x14), line=RULE_DARK, line_width=0.5)
        add_text(s, x + Inches(0.25), y + Inches(0.12), cw - Inches(0.5), Inches(0.25),
                 pre, font=F_SERIF, size=11, italic=True, color=WHITE_MUTE)
        add_text(s, x + Inches(0.25), y + Inches(0.37), cw - Inches(0.5), Inches(0.4),
                 city, font=F_TIGHT, size=22, color=RED, bold=True, letter_spacing=20)

    add_chrome(s, 13, TOTAL, "The Franchise")
    return s


def slide_14_rounds(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "THE ASK · 3 ROUNDS OF INVESTMENT")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12.2), Inches(1.0), [
        {"text": "We are seeking ", "font": F_TIGHT, "size": 30, "color": WHITE, "bold": True},
        {"text": "$9.5M total", "font": F_TIGHT, "size": 30, "color": RED, "bold": True},
        {"text": ", split across three rounds.", "font": F_TIGHT, "size": 30, "color": WHITE, "bold": True},
    ], line_spacing=1.05)

    # 3 round cards side by side
    rounds = [
        ("01", "ROUND ONE · PREPRODUCTION", "$1M", "opens June 1, 2026 · closes Q3 2026",
         "Equity + profit-sharing", "$1M for 10% equity",
         "Design dev · venue lease · advance marketing",
         "Equity participates in acquisition / licensing / expansion"),
        ("02", "ROUND TWO · PRODUCTION", "$7M", "opens January 1, 2027 · closes Q2 2027",
         "Profit-sharing only · no equity", "$50K · Class A LP units",
         "Venue build · production · cast · install · marketing · reserve",
         "First-position 110% recoupment · 50/50 net profit"),
        ("03", "ROUND THREE · LAUNCH", "$1.5M", "opens June 1, 2027 · closes Q4 2027",
         "Profit-sharing only · no equity", "$50K · Class A LP units",
         "Launch marketing · operating reserve · contingency",
         "First-position 110% recoupment · 50/50 net profit"),
    ]
    cw = Inches(4.05); ch = Inches(4.5); gap = Inches(0.15)
    sx = Inches(0.6); sy = Inches(2.2)
    for i, (num, name, amt, when, structure, mins, use, recoup) in enumerate(rounds):
        x = sx + (cw + gap) * i; y = sy
        is_r1 = (i == 0)
        bg = RGBColor(0x2A, 0x10, 0x12) if is_r1 else RGBColor(0x14, 0x14, 0x14)
        border = RED if is_r1 else RULE_DARK
        add_rect(s, x, y, cw, ch, fill=bg, line=border, line_width=1.5 if is_r1 else 0.5)
        add_text(s, x + Inches(0.25), y + Inches(0.2), Inches(0.6), Inches(0.4),
                 num, font=F_DISPLAY, size=26, color=RED, bold=True, letter_spacing=-10)
        add_text(s, x + Inches(0.95), y + Inches(0.22), cw - Inches(1.2), Inches(0.25),
                 name, font=F_MONO, size=8, color=RED, letter_spacing=160)
        add_text(s, x + Inches(0.95), y + Inches(0.42), cw - Inches(0.2), Inches(0.45),
                 amt, font=F_DISPLAY, size=32, color=WHITE, bold=True, letter_spacing=-15)
        add_text(s, x + Inches(0.25), y + Inches(0.95), cw - Inches(0.5), Inches(0.3),
                 when, font=F_SERIF, size=11, italic=True, color=WHITE_MUTE)
        add_line(s, x + Inches(0.25), y + Inches(1.4), x + cw - Inches(0.25), y + Inches(1.4), color=RULE_DARK, width=0.5)
        # Detail rows
        details = [("STRUCTURE", structure), ("MINIMUM" if not is_r1 else "EQUITY OFFERED", mins),
                   ("USE", use), ("UPSIDE" if is_r1 else "RECOUPMENT", recoup)]
        for j, (k, v) in enumerate(details):
            dy = y + Inches(1.55 + j * 0.65)
            add_text(s, x + Inches(0.25), dy, cw - Inches(0.5), Inches(0.2),
                     k, font=F_MONO, size=8, color=RED, letter_spacing=160)
            add_text(s, x + Inches(0.25), dy + Inches(0.22), cw - Inches(0.5), Inches(0.4),
                     v, font=F_BODY, size=10, color=WHITE, line_spacing=1.3)

    add_chrome(s, 14, TOTAL, "Investment Rounds")
    return s


def slide_15_round1_equity(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "ROUND ONE · EQUITY INVESTMENT")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.9), [
        {"text": "Only Round One investors ", "font": F_TIGHT, "size": 30, "color": RED, "bold": True},
        {"text": "get equity in the show.", "font": F_TIGHT, "size": 30, "color": WHITE, "bold": True},
    ], line_spacing=1.05)

    # Big headline: $1M for 10%
    box = add_rect(s, Inches(0.6), Inches(2.05), Inches(12), Inches(1.45),
                   fill=RGBColor(0x2A, 0x10, 0x12), line=RED, line_width=1.5)
    add_text(s, Inches(0.85), Inches(2.25), Inches(3.5), Inches(1.0),
             "$1M", font=F_DISPLAY, size=64, color=RED, bold=True, letter_spacing=-25)
    add_text(s, Inches(4.4), Inches(2.7), Inches(1), Inches(0.5),
             "for", font=F_SERIF, size=22, italic=True, color=WHITE_MUTE)
    add_text(s, Inches(5.4), Inches(2.25), Inches(3.5), Inches(1.0),
             "10%", font=F_DISPLAY, size=64, color=RED, bold=True, letter_spacing=-25)
    add_text(s, Inches(10), Inches(2.8), Inches(2.5), Inches(0.3),
             "EQUITY UP FOR GRABS", font=F_MONO, size=10, color=WHITE_MUTE, letter_spacing=200, align="right")

    # Lede
    add_text(s, Inches(0.6), Inches(3.7), Inches(12), Inches(0.6),
             "Round One investors hold equity through the LA run, the events business, the franchise, and any liquidity event that follows. They also participate in the profit-share. Rounds Two and Three are profit-share only.",
             font=F_BODY, size=12, color=WHITE_MUTE, line_spacing=1.4)

    # Acquisition table (left)
    add_text(s, Inches(0.6), Inches(4.6), Inches(7), Inches(0.25),
             "HOW EQUITY MAKES MONEY · ACQUISITION COMPARABLES",
             font=F_MONO, size=10, color=RED, letter_spacing=160)
    add_table(s, Inches(0.6), Inches(4.95), Inches(6.5), Inches(1.85),
              ["COMPANY", "BUYER", "AMOUNT"],
              [
                  ["Cirque du Soleil", "TPG / Fosun / CDPQ", "~$1.5B"],
                  ["Secret Cinema", "TodayTix Group", "$100M+ / ~£88M"],
                  ["Blue Man Group", "Cirque du Soleil", "~$65.5M"],
              ])

    # Expansion (right)
    add_text(s, Inches(7.5), Inches(4.6), Inches(5), Inches(0.25),
             "EXPANSION & LICENSING",
             font=F_MONO, size=10, color=RED, letter_spacing=160)
    expansions = [
        ("Sleep No More", "— expanded to Shanghai and Seoul"),
        ("Meow Wolf", "— six immersive installations across the U.S."),
        ("Secret Cinema", "— 50+ productions; Disney, Marvel, Netflix"),
    ]
    for i, (name, desc) in enumerate(expansions):
        y = Inches(5.0 + i * 0.55)
        add_text(s, Inches(7.5), y, Inches(0.25), Inches(0.3),
                 "→", font=F_DISPLAY, size=14, color=RED, bold=True)
        add_text(s, Inches(7.8), y, Inches(2), Inches(0.3),
                 name, font=F_DISPLAY, size=12, color=WHITE, bold=True, letter_spacing=40)
        add_text(s, Inches(9.7), y, Inches(3.5), Inches(0.4),
                 desc, font=F_BODY, size=11, color=WHITE_MUTE, line_spacing=1.3)

    # Foot
    add_inline_text(s, Inches(0.6), Inches(7.0), Inches(12), Inches(0.4), [
        {"text": "Round One investors also participate in the profit-share", "font": F_SERIF, "size": 14, "color": RED, "italic": True},
        {"text": " alongside Rounds Two and Three.", "font": F_SERIF, "size": 14, "color": WHITE, "italic": True},
    ], line_spacing=1.3)

    add_chrome(s, 15, TOTAL, "Round 1 · Equity Model")
    return s


def slide_16_financials_tickets(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "FINANCIAL PROJECTIONS · TICKET SALES")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.9), [
        {"text": "Two thresholds. ", "font": F_TIGHT, "size": 30, "color": WHITE, "bold": True},
        {"text": "One investor return curve.", "font": F_TIGHT, "size": 30, "color": RED, "bold": True},
    ], line_spacing=1.05)

    # 3 threshold boxes
    thresholds = [
        ("TO KEEP THE SHOW RUNNING", "61%", "capacity · ~92 of 150 avg seats / show · breakeven", WHITE, RULE_DARK, RGBColor(0x11, 0x11, 0x11)),
        ("FOR INVESTORS TO RECOUP", "75%", "capacity · the threshold at which investors recoup 110% within the 18-mo run", RED, RED, RGBColor(0x2A, 0x10, 0x12)),
        ("PILOT-LEVEL DEMAND", "100%+", "capacity · what the Ford pilot actually did · oversold", GOLD, GOLD, RGBColor(0x1F, 0x18, 0x10)),
    ]
    tw = Inches(4.05); th = Inches(1.8); tgap = Inches(0.15)
    tsx = Inches(0.6); tsy = Inches(2.05)
    for i, (lbl, num, sub, color, border, bg) in enumerate(thresholds):
        x = tsx + (tw + tgap) * i; y = tsy
        add_rect(s, x, y, tw, th, fill=bg, line=border, line_width=1.0)
        add_text(s, x + Inches(0.2), y + Inches(0.15), tw - Inches(0.4), Inches(0.25),
                 lbl, font=F_MONO, size=9, color=color, letter_spacing=160)
        add_text(s, x + Inches(0.2), y + Inches(0.45), tw - Inches(0.4), Inches(0.9),
                 num, font=F_DISPLAY, size=54, color=color, bold=True, letter_spacing=-20)
        add_text(s, x + Inches(0.2), y + Inches(1.3), tw - Inches(0.4), Inches(0.45),
                 sub, font=F_BODY, size=10, color=WHITE_MUTE, line_spacing=1.3)

    # Returns / capacity scenarios
    add_text(s, Inches(0.6), Inches(4.05), Inches(8), Inches(0.25),
             "RETURN PROJECTIONS — AFTER 14 MONTHS",
             font=F_MONO, size=10, color=RED, letter_spacing=180)
    scenarios = [
        ("80% of tickets", 0.50, "~$3.2M net contribution", False),
        ("90% of tickets", 0.75, "~$4.4M net contribution", False),
        ("100% of tickets", 1.00, "~$5.5M net contribution", True),
    ]
    for i, (label, w_pct, val, is_us) in enumerate(scenarios):
        y = Inches(4.4 + i * 0.4)
        add_text(s, Inches(0.6), y, Inches(2.5), Inches(0.3),
                 "If we sell " + label, font=F_BODY, size=11,
                 color=RED if is_us else WHITE, bold=is_us)
        # Bar track
        bar_x = Inches(3.3); bar_w = Inches(7.5); bar_h = Inches(0.22)
        add_rect(s, bar_x, y + Inches(0.05), bar_w, bar_h,
                 fill=RGBColor(0x18, 0x18, 0x18), line=RULE_DARK, line_width=0.5)
        # Fill
        fill_w = Emu(int(bar_w * w_pct))
        add_rect(s, bar_x, y + Inches(0.05), fill_w, bar_h,
                 fill=RED if is_us else RGBColor(0x60, 0x5C, 0x55))
        add_text(s, Inches(11), y, Inches(2), Inches(0.3),
                 val, font=F_TIGHT, size=12, color=RED if is_us else WHITE, bold=True, align="right")

    # Caption
    add_text(s, Inches(0.6), Inches(5.7), Inches(12), Inches(0.4),
             "Net contribution after operating costs & recoupment. Pilot at the Ford oversold at 100%+. Projections assume the run begins June 2027; numbers expand further with events business (next slide).",
             font=F_SERIF, size=10, italic=True, color=WHITE_DIM, line_spacing=1.4)

    # Tier table
    add_table(s, Inches(0.6), Inches(6.3), Inches(12), Inches(0.95),
              ["TIER", "SEATS / WK", "AVG $", "WEEKLY $"],
              [
                  ["Community", "520", "$50", "$26,400"],
                  ["Standard", "720", "$83", "$58,800"],
                  ["Premium", "480", "$132", "$63,000"],
                  ["VIP · Saturday only", "80", "$185", "$14,800"],
              ])

    add_chrome(s, 16, TOTAL, "Financials · Tickets")
    return s


def slide_17_financials_events(prs):
    s = blank_slide(prs, INK)
    add_eyebrow(s, Inches(0.6), Inches(0.5), "FINANCIAL PROJECTIONS · CORPORATE EVENTS")
    add_inline_text(s, Inches(0.6), Inches(0.95), Inches(12), Inches(0.9), [
        {"text": "210 dark day-equivalents. ", "font": F_TIGHT, "size": 28, "color": WHITE, "bold": True},
        {"text": "All six differentiators.", "font": F_TIGHT, "size": 28, "color": RED, "bold": True},
    ], line_spacing=1.05)
    add_text(s, Inches(0.6), Inches(2.0), Inches(12), Inches(0.65),
             "The show occupies the venue Thursday–Sunday evenings and weekend afternoons. Monday through Wednesday — and weekday daytime — sit dark. Roughly 3.5 fully rentable days/week × 60 weeks = ~210 day-equivalents of unused premium real estate.",
             font=F_BODY, size=11, color=WHITE_MUTE, line_spacing=1.45)

    # Left: WHAT WE HAVE
    add_text(s, Inches(0.6), Inches(3.0), Inches(7), Inches(0.25),
             "WHAT WE HAVE", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_line(s, Inches(0.6), Inches(3.3), Inches(7.4), Inches(3.3), color=RULE_DARK, width=0.5)
    differentiators = [
        ("110-ft permanent LED wall", "$5K–$20K / day"),
        ("Real bar program", "$8K–$15K / day"),
        ("150-seat proscenium theater", "$5K–$10K / day"),
        ("Outdoor red-carpet courtyard", "Premiere-tier"),
        ("30,000 sq ft of versatile space", "$10K+ / day comp"),
        ("Arts District location", "Premium tier"),
    ]
    for i, (item, val) in enumerate(differentiators):
        y = Inches(3.4 + i * 0.35)
        add_text(s, Inches(0.6), y, Inches(4.8), Inches(0.25),
                 item, font=F_BODY, size=10, color=WHITE)
        add_text(s, Inches(5.4), y, Inches(2), Inches(0.25),
                 val, font=F_MONO, size=9, color=RED, letter_spacing=80, align="right")

    # Callout
    cb = add_rect(s, Inches(0.6), Inches(5.6), Inches(6.8), Inches(0.45),
                   fill=RGBColor(0x2A, 0x10, 0x12))
    add_rect(s, Inches(0.6), Inches(5.6), Inches(0.05), Inches(0.45), fill=RED)
    add_inline_text(s, Inches(0.75), Inches(5.7), Inches(6.6), Inches(0.3), [
        {"text": "MOST LA VENUES OFFER ONE OR TWO. ", "font": F_DISPLAY, "size": 11, "color": WHITE, "bold": True, "letter_spacing": 80},
        {"text": "WE HAVE ALL SIX.", "font": F_DISPLAY, "size": 11, "color": RED, "bold": True, "letter_spacing": 80},
    ])

    # Right: RUN-PERIOD REVENUE
    add_text(s, Inches(7.8), Inches(3.0), Inches(5), Inches(0.25),
             "RUN-PERIOD REVENUE", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_table(s, Inches(7.8), Inches(3.35), Inches(4.9), Inches(1.6),
              ["SCENARIO", "GROSS", "NET"],
              [
                  ["Conservative ~30%", "$540K", "+$405K"],
                  ["Moderate ~50%", "$1.13M", "+$847K"],
                  ["Aggressive ~65%", "$1.82M", "+$1.37M"],
              ])
    # What we sell
    add_text(s, Inches(7.8), Inches(5.15), Inches(5), Inches(0.25),
             "WHAT WE SELL", font=F_MONO, size=10, color=RED, letter_spacing=180)
    sales = [
        ("Full venue buyout · premieres", "$25K–$45K"),
        ("Single-space rental · launches", "$6K–$12K"),
        ("Production / filming", "$8K–$18K / day"),
        ("Recurring programs · comedy", "$2K–$5K"),
    ]
    for i, (item, val) in enumerate(sales):
        y = Inches(5.55 + i * 0.32)
        add_text(s, Inches(7.8), y, Inches(3), Inches(0.25),
                 item, font=F_BODY, size=10, color=WHITE_MUTE)
        add_text(s, Inches(10.9), y, Inches(1.8), Inches(0.25),
                 val, font=F_MONO, size=9, color=RED, letter_spacing=80, align="right")

    add_chrome(s, 17, TOTAL, "Financials · Events")
    return s


def slide_18_creator(prs):
    s = blank_slide(prs, INK)
    add_image(s, os.path.join(ASSETS, "stage.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    from lxml import etree
    sf = overlay.fill._xPr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        alpha = etree.SubElement(srgb, qn("a:alpha"))
        alpha.set("val", "65000")
    overlay.line.fill.background()

    # Centered card
    cx = Inches(1.5); cy = Inches(1.0); cw = Inches(10.3); ch = Inches(5.7)
    add_text(s, cx, cy, cw, Inches(0.3),
             "A NOTE FROM THE CREATOR · DIANE LUBY LANE",
             font=F_MONO, size=11, color=RED, letter_spacing=200)
    add_line(s, cx, cy + Inches(0.35), cx + Inches(4), cy + Inches(0.35), color=RED, width=1)

    add_text(s, cx, cy + Inches(0.8), cw, Inches(0.7),
             "In Los Angeles, things take root.",
             font=F_SERIF, size=32, italic=True, color=WHITE, line_spacing=1.35)
    add_text(s, cx, cy + Inches(1.65), cw, Inches(1.6),
             "People from all over the world feel this — and so they flock here, the dreamers, the wanderers, the immigrants, in search of a chance, a rebirth, a fresh start. And the city receives them.",
             font=F_SERIF, size=24, italic=True, color=WHITE, line_spacing=1.4)
    add_text(s, cx, cy + Inches(3.4), cw, Inches(0.7),
             "Los Angeles has loved us.",
             font=F_SERIF, size=26, italic=True, color=WHITE, bold=True)
    add_text(s, cx, cy + Inches(4.2), cw, Inches(0.7),
             "With this show, we offer that love back.",
             font=F_SERIF, size=26, italic=True, color=RED, bold=True)
    add_text(s, cx, cy + Inches(5.1), cw, Inches(0.3),
             "— Diane Luby Lane · Creator",
             font=F_SERIF, size=12, italic=True, color=WHITE_DIM)

    add_chrome(s, 18, TOTAL, "Note from the Creator")
    return s


def slide_19_reserve(prs):
    s = blank_slide(prs, INK)
    add_image(s, os.path.join(ASSETS, "crowd.jpg"), Inches(0), Inches(0), SLIDE_W, SLIDE_H)
    overlay = add_rect(s, 0, 0, SLIDE_W, SLIDE_H, fill=INK)
    from lxml import etree
    sf = overlay.fill._xPr.find(qn("a:solidFill"))
    if sf is not None:
        srgb = sf.find(qn("a:srgbClr"))
        alpha = etree.SubElement(srgb, qn("a:alpha"))
        alpha.set("val", "65000")
    overlay.line.fill.background()

    add_eyebrow(s, Inches(0.6), Inches(0.8), "RESERVE YOUR PLACE IN ROUND ONE")

    add_text(s, Inches(0.6), Inches(1.6), Inches(12), Inches(1.0),
             "Be part of",
             font=F_TIGHT, size=64, color=WHITE, bold=True, line_spacing=1.0, letter_spacing=-25)
    add_inline_text(s, Inches(0.6), Inches(2.55), Inches(12), Inches(1.6), [
        {"text": "the ", "font": F_TIGHT, "size": 84, "color": WHITE, "bold": True, "letter_spacing": -25},
        {"text": "awakening.", "font": F_SERIF, "size": 84, "color": RED, "italic": True, "letter_spacing": -25},
    ], line_spacing=1.0)

    # Bottom 2-column info
    info_y = Inches(5.0)
    add_text(s, Inches(0.6), info_y, Inches(5), Inches(0.3),
             "TO RESERVE OR LEARN MORE", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_text(s, Inches(0.6), info_y + Inches(0.4), Inches(6), Inches(0.5),
             "press@ifiawaken.la", font=F_TIGHT, size=28, color=GREEN, bold=True, letter_spacing=-10)
    add_text(s, Inches(0.6), info_y + Inches(1.0), Inches(6), Inches(0.3),
             "ifiawaken.la · @ifiawaken",
             font=F_SERIF, size=14, italic=True, color=WHITE_MUTE)

    add_text(s, Inches(7.5), info_y, Inches(5), Inches(0.3),
             "ROUND ONE CLOSES", font=F_MONO, size=10, color=RED, letter_spacing=180)
    add_text(s, Inches(7.5), info_y + Inches(0.4), Inches(5), Inches(0.5),
             "Q3 2026", font=F_TIGHT, size=36, color=WHITE, bold=True, letter_spacing=-10)
    add_text(s, Inches(7.5), info_y + Inches(1.05), Inches(5), Inches(0.3),
             "Doors open · June 2027",
             font=F_SERIF, size=14, italic=True, color=WHITE_MUTE)

    # Foot
    add_line(s, Inches(0.6), Inches(7.0), SLIDE_W - Inches(0.6), Inches(7.0), color=RULE_DARK, width=0.5)
    add_text(s, Inches(0.6), Inches(7.1), Inches(7), Inches(0.25),
             "IF I AWAKEN IN LOS ANGELES · PITCH 2026",
             font=F_MONO, size=9, color=WHITE_DIM, letter_spacing=160)
    add_text(s, Inches(7), Inches(7.1), Inches(6), Inches(0.25),
             "AN IMMERSIVE THEATRICAL TOUR OF THE REAL LOS ANGELES",
             font=F_MONO, size=9, color=WHITE_DIM, letter_spacing=160, align="right")

    return s


# ----- MAIN --------------------------------------------------------------

def build():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    slide_01_cover(prs)
    slide_02_hook(prs)
    slide_03_pilot(prs)
    slide_04_album(prs)
    slide_05_awakening(prs)
    slide_06_show(prs)
    slide_07_experience(prs)
    slide_08_journey(prs)
    slide_09_building(prs)
    slide_10_team(prs)
    slide_11_market_cities(prs)
    slide_12_market_la(prs)
    slide_13_market_franchise(prs)
    slide_14_rounds(prs)
    slide_15_round1_equity(prs)
    slide_16_financials_tickets(prs)
    slide_17_financials_events(prs)
    slide_18_creator(prs)
    slide_19_reserve(prs)

    out = os.path.join(os.path.dirname(__file__), "pitch-2026.pptx")
    prs.save(out)
    print(f"Saved: {out}")
    return out


if __name__ == "__main__":
    build()
