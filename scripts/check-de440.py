"""Independent midnight check: python scripts/check-de440.py /path/to/de440.bsp

Requires skyfield==1.55. Uses the full DE440 (de440s does not cover 1848).
NAOJ source: https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi
The date, minute, and annual Delta T below were read with year=YEAR&lst=8
on 2026-09-21. This script does not change the website dataset.
"""

import sys
from contextlib import closing
from datetime import datetime, timedelta

from skyfield import almanac, almanac_east_asia
from skyfield.api import load, load_file
from skyfield.framelib import ecliptic_frame

# Source event date is preserved even when its minute value is 24:00.
CASES = [
    ("冬至", "1848-12-21", "24:00", 270, 8.847207644),
    ("冬至", "1881-12-22", "00:00", 270, -3.520211344),
    ("立夏", "1911-05-07", "00:00", 45, 12.455076416),
    ("雨水", "1923-02-19", "24:00", 330, 23.133377344),
    ("冬至", "1951-12-23", "00:00", 270, 29.3220207478519),
    ("大寒", "1979-01-20", "24:00", 300, 49.0),
    ("春分", "2084-03-20", "00:00", 0, 89.4532180897396),
]


def local_ut(ts, t, delta_t):
    # Format TT - Delta T + 8h as a calendar date without invoking UTC/leap seconds.
    y, m, d, h, minute, second = ts.tt_jd(
        t.whole, t.tt_fraction + (28800 - delta_t) / 86400
    ).tt_calendar()
    return datetime(int(y), int(m), int(d), int(h), int(minute)) + timedelta(
        seconds=float(second)
    )


if __name__ == "__main__":
    assert len(sys.argv) == 2, __doc__
    ts = load.timescale()
    with closing(load_file(sys.argv[1])) as eph:
        solar_terms = almanac_east_asia.solar_terms(eph)
        for name, date, minute, angle, delta_t in CASES:
            y, m, d = map(int, date.split("-"))
            times, indices = almanac.find_discrete(
                ts.tt(y, m, d - 1), ts.tt(y, m, d + 1), solar_terms
            )
            assert len(times) == 1 and indices[0] == angle // 15
            t = times[0]
            longitude = eph["earth"].at(t).observe(eph["sun"]).apparent().frame_latlon(
                ecliptic_frame
            )[1].degrees
            assert abs((longitude - angle + 180) % 360 - 180) < 0.000001
            local = local_ut(ts, t, delta_t)
            default = local_ut(ts, t, float(t.delta_t))
            total_seconds = (local - local.replace(hour=0, minute=0, second=0, microsecond=0)).total_seconds()
            rounded_minutes = int((total_seconds + 30) // 60)
            rounded = f"{rounded_minutes // 60:02}:{rounded_minutes % 60:02}"
            assert local.date().isoformat() == date, (name, local, date)
            assert rounded == minute, (name, rounded, minute)
            assert default.date() == local.date(), (name, local, default)
            print(f"{name} | NAOJ ΔT: {local.isoformat(' ', timespec='milliseconds')}"
                  f" | Skyfield ΔT: {default.isoformat(' ', timespec='milliseconds')}"
                  f" | NAOJ: {date} {minute}")
    print("All 7 event dates agree; 3 before midnight, 4 after midnight.")
