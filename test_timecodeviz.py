from timecodeviz import TimeParser
from unittest import mock
import pytest



@pytest.fixture
def m_open():
    with mock.patch("timecodeviz.open", create=True) as mock_open:
        ages = [
            'foo/bar.py,10',
            'foo/boo.py,5',
            'blink.py,5'
        ]
        changes = [
            'foo/bar.py,100',
            'foo/boo.py,1',
            'blink.py,20'
        ]
        sizes = [
            'blink.py,10',
            'foo/boo.py,40',
            'foo/bar.py,200'
        ]
        mock_open.return_value.__enter__.return_value.readlines.side_effect = [
            changes,
            sizes,
            ages
        ]
        yield mock_open


def test_read_file(m_open):
    input_dir = "foo"
    t = TimeParser(input_dir)

    t.parse()

    result = t.to_d3_json()

    assert "foo" in [f["name"] for f in result["children"]]
