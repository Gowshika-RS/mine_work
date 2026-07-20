import csv
import os
import xml.etree.ElementTree as ET
from functools import lru_cache
from typing import Dict, Any


def _dataset_paths() -> Dict[str, str]:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    archive_dir = os.path.join(base_dir, 'archive (5)')
    return {
        'base_dir': base_dir,
        'archive_dir': archive_dir,
        'annotations': os.path.join(archive_dir, 'annotations.xml'),
        'miners_csv': os.path.join(archive_dir, 'miners.csv'),
    }


@lru_cache(maxsize=1)
def get_dataset_metrics() -> Dict[str, Any]:
    paths = _dataset_paths()

    try:
        tree = ET.parse(paths['annotations'])
        root = tree.getroot()
    except FileNotFoundError:
        return {
            'available': False,
            'reason': 'Dataset file not found',
            'image_count': 0,
            'annotation_count': 0,
            'sitting_count': 0,
            'standing_count': 0,
            'sitting_ratio': 0.0,
            'standing_ratio': 0.0,
            'average_box_width': 0.0,
            'average_box_height': 0.0,
            'average_box_area': 0.0,
            'average_box_coverage_pct': 0.0,
            'source': 'annotation archive unavailable',
        }

    images = root.findall('image')
    annotation_count = 0
    sitting_count = 0
    standing_count = 0
    total_box_width = 0.0
    total_box_height = 0.0
    total_box_area = 0.0
    total_image_area = 0.0

    for image in images:
        width = float(image.attrib.get('width', 0) or 0)
        height = float(image.attrib.get('height', 0) or 0)
        if width and height:
            total_image_area += width * height

        for box in image.findall('box'):
            annotation_count += 1
            xtl = float(box.attrib.get('xtl', 0) or 0)
            ytl = float(box.attrib.get('ytl', 0) or 0)
            xbr = float(box.attrib.get('xbr', 0) or 0)
            ybr = float(box.attrib.get('ybr', 0) or 0)
            width_px = max(0.0, xbr - xtl)
            height_px = max(0.0, ybr - ytl)
            area_px = width_px * height_px

            total_box_width += width_px
            total_box_height += height_px
            total_box_area += area_px

            is_sitting = False
            for attribute in box.findall('attribute'):
                if attribute.attrib.get('name') == 'is_sitting':
                    is_sitting = str(attribute.text or '').lower() == 'true'
                    break

            if is_sitting:
                sitting_count += 1
            else:
                standing_count += 1

    if annotation_count:
        sitting_ratio = round((sitting_count / annotation_count) * 100, 1)
        standing_ratio = round((standing_count / annotation_count) * 100, 1)
        average_box_width = round(total_box_width / annotation_count, 1)
        average_box_height = round(total_box_height / annotation_count, 1)
        average_box_area = round(total_box_area / annotation_count, 1)
        average_box_coverage_pct = round((total_box_area / max(1.0, annotation_count) / max(1.0, total_image_area / max(1, len(images)))) * 100, 1) if images else 0.0
    else:
        sitting_ratio = 0.0
        standing_ratio = 0.0
        average_box_width = 0.0
        average_box_height = 0.0
        average_box_area = 0.0
        average_box_coverage_pct = 0.0

    try:
        with open(paths['miners_csv'], newline='', encoding='utf-8-sig') as handle:
            csv_rows = list(csv.DictReader(handle))
            csv_count = len(csv_rows)
    except FileNotFoundError:
        csv_count = len(images)

    return {
        'available': True,
        'reason': 'Dataset loaded from annotations.xml and miners.csv',
        'image_count': len(images),
        'csv_row_count': csv_count,
        'annotation_count': annotation_count,
        'sitting_count': sitting_count,
        'standing_count': standing_count,
        'sitting_ratio': sitting_ratio,
        'standing_ratio': standing_ratio,
        'average_box_width': average_box_width,
        'average_box_height': average_box_height,
        'average_box_area': average_box_area,
        'average_box_coverage_pct': average_box_coverage_pct,
        'source': 'archive (5)/annotations.xml',
    }
