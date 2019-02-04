


class TimeParser(object):

    """Docstring for TimeParser. """

    def __init__(self, input_dir):
        """TODO: to be defined1.

        :changes: TODO
        :sizes: TODO

        """
        self._info_map = {}
        self._dir = input_dir
        self._max_changes = 0
        self._min_changes = 100000
        self._max_age = 0
        self._min_age = 1000000

    def parse(self):
        """TODO: Docstring for parse.
        :returns: TODO

        """
        changes_file = self._dir + '/changes.log'
        with open(changes_file) as c:
            changes = c.readlines()

        sizes_file = self._dir + '/sizes.log'
        with open(sizes_file) as s:
            sizes = s.readlines()

        ages_files = self._dir + '/ages.log'
        with open(ages_files) as a:
            ages = a.readlines()

        for c in changes:
            node = self._info_map
            file_path, changes = c.split(",")
            for part in file_path.split("/"):
                part = part.rstrip()
                node.setdefault(part, {})

                node = node[part]
            changes = int(changes.rstrip())
            self._max_changes = max(changes, self._max_changes)
            self._min_changes = min(changes, self._min_changes)
            node["changes"] = changes

        for a in ages:
            node = self._info_map
            file_path, ages = a.split(",")
            for part in file_path.split("/"):
                part = part.rstrip()
                node.setdefault(part, {})
                node = node[part]
            age = int(ages.rstrip())
            self._max_age = max(age, self._max_age)
            self._min_age = min(age, self._min_age)
            node["age"] = age

        for s in sizes:
            file_path, size = s.split(",")
            node = self._info_map
            for part in file_path.lstrip("./").split("/"):
                part = part.rstrip()
                node.setdefault(part, {})
                node = node[part]
            size = int(int(size.rstrip()))
            node["size"] = size

    def to_d3_json(self):
        def _build_leaf_node(name, node):
            return {
                "size": node["size"],
                "age": node["age"],
                "changes": node["changes"],
                "name": name,
                "age_color": int( 255 / (self._max_age - self._min_age) * (node["age"] - self._min_age)),
                "changes_color": int( 255 / (self._max_changes - self._min_changes) * (node["changes"] - self._min_changes))
            }

        def _populate_children(node, d3_node):
            for key in node:
                if "size" in node[key] or "age" in node[key] or "changes" in node[key]:
                    if  "size" in node[key] and "age" in node[key] and "changes" in node[key]:
                        d3_node["children"].append(_build_leaf_node(key, node[key]))
                else:
                    child = node[key]
                    new_d3_node = {
                        "name": key,
                        "children": []
                    }
                    _populate_children(child, new_d3_node)
                    if new_d3_node["children"]:
                        d3_node["children"].append(new_d3_node)
        root = self._info_map

        d3_root = {
            "name": "result",
            "children": []
        }

        _populate_children(root, d3_root)

        return d3_root


if __name__ == "__main__":
    import sys
    import argparse
    import json
    parser = argparse.ArgumentParser()
    parser.add_argument("directory")
    args = parser.parse_args()
    p = TimeParser(args.directory)
    p.parse()
    print(json.dumps(p.to_d3_json()))

