package migrations

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"strings"
)

func bindata_read(data []byte, name string) ([]byte, error) {
	gz, err := gzip.NewReader(bytes.NewBuffer(data))
	if err != nil {
		return nil, fmt.Errorf("Read %q: %v", name, err)
	}

	var buf bytes.Buffer
	_, err = io.Copy(&buf, gz)
	gz.Close()

	if err != nil {
		return nil, fmt.Errorf("Read %q: %v", name, err)
	}

	return buf.Bytes(), nil
}

var __000001_create_environments_table_down_sql = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\x72\x09\xf2\x0f\x50\x08\x71\x74\xf2\x71\x55\xf0\x74\x53\x70\x8d\xf0\x0c\x0e\x09\x56\x48\xcd\x2b\xcb\x2c\xca\xcf\xcb\x4d\xcd\x2b\x29\xb6\xe6\x02\x04\x00\x00\xff\xff\x5c\xbe\x76\x5c\x23\x00\x00\x00")

func _000001_create_environments_table_down_sql() ([]byte, error) {
	return bindata_read(
		__000001_create_environments_table_down_sql,
		"000001_create_environments_table.down.sql",
	)
}

var __000001_create_environments_table_up_sql = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\x72\x0e\x72\x75\x0c\x71\x55\x08\x71\x74\xf2\x71\x55\xf0\x74\x53\xf0\xf3\x0f\x51\x70\x8d\xf0\x0c\x0e\x09\x56\x48\xcd\x2b\xcb\x2c\xca\xcf\xcb\x4d\xcd\x2b\x29\x56\xd0\xe0\xe2\x2c\x2d\xcd\x4c\x51\x08\x71\x8d\x08\x01\x2b\xf2\x0b\xf5\xf1\xd1\xe1\xe2\xcc\x4e\xad\xc4\x10\x2b\x4b\xcc\x29\x4d\xc5\x10\x2d\x28\xca\xcf\x4a\x4d\x2e\xc1\x10\x4f\x49\x2d\x28\x4a\x4d\x4e\x2c\x49\x4d\x51\xf0\xf4\x0b\x71\x75\x77\x0d\x82\xcb\x72\x69\x5a\x03\x02\x00\x00\xff\xff\x76\xca\x0d\x12\xa0\x00\x00\x00")

func _000001_create_environments_table_up_sql() ([]byte, error) {
	return bindata_read(
		__000001_create_environments_table_up_sql,
		"000001_create_environments_table.up.sql",
	)
}

var __000002_add_environments_primary_key_down_sql = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\x6c\x90\xc1\x4e\xf3\x30\x10\x84\xcf\xf5\x53\xcc\xf1\xff\x11\x79\x82\x9c\x42\xd9\xa2\x48\x6e\x02\xce\x22\xf5\x86\xac\x78\x0b\x86\x34\x8e\x1c\x27\xa8\x6f\x8f\x8a\x10\x08\x92\xeb\x37\x23\xed\x7e\xb3\x35\x54\x30\x81\x8b\x1b\x4d\x28\x77\xa8\x6a\x06\x1d\xca\x86\x1b\x48\x3f\xfb\x18\xfa\x93\xf4\x69\x7c\x1a\xa2\xcc\x3e\x4c\x23\xfe\xa9\xcd\x34\x79\x07\xa6\x03\x7f\xb6\xab\x47\xad\xaf\xd5\xe6\x4d\xce\x0b\x36\xdb\x6e\x92\x05\x1d\x62\x78\x95\x36\x2d\xb8\x93\x21\x4a\x6b\x93\x38\x94\x15\xd3\x1d\x99\xef\x54\xfd\xcf\x95\x2a\xab\x86\x0c\x5f\xb2\x7a\xfd\x37\xd5\x90\xa6\x2d\xe3\x0a\x3b\x53\xef\x7f\x75\x72\xa5\x6e\x4d\x7d\xff\xe3\xb9\xe2\x98\x23\xcb\x32\x34\x0f\xda\x27\x81\x0b\x32\xa2\x0f\x09\xb6\xeb\xc2\x3b\xac\x73\xbe\x7f\x86\xc5\x10\xfd\xc9\xc6\x33\x2e\xba\xf6\x98\x24\x22\xbd\x08\x8e\xb6\x4d\x4a\x15\x9a\xc9\x7c\x9d\x58\x1f\xcf\x50\x55\xec\x09\x7f\x04\xf2\x8f\x00\x00\x00\xff\xff\x1b\x73\x78\xdd\x85\x01\x00\x00")

func _000002_add_environments_primary_key_down_sql() ([]byte, error) {
	return bindata_read(
		__000002_add_environments_primary_key_down_sql,
		"000002_add_environments_primary_key.down.sql",
	)
}

var __000002_add_environments_primary_key_up_sql = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\x6c\x90\xc1\x6e\xf2\x30\x10\x84\xcf\xf8\x29\xe6\x08\xbf\xc2\x13\xe4\x94\x9f\x2e\x55\xd4\xe0\x50\x7b\x2b\xc1\x09\x59\x78\x69\x53\xc0\x89\x8c\xa1\xe5\xed\x2b\x2a\x24\x68\xd3\xeb\x8c\xe5\xf9\xf6\x9b\x18\x2a\x98\xc0\xc5\xff\x8a\x50\x4e\xa1\x6b\x06\x2d\x4a\xcb\x16\x12\x4e\x4d\x6c\xc3\x5e\x42\x3a\xac\x82\x7c\x26\x0c\xd5\xe0\x78\x6c\x3c\x98\x16\xfc\xfd\x52\xbf\x54\x55\xa6\x06\x5b\x39\xf7\xb2\x93\xdb\x1d\xa5\x97\x76\xb1\x7d\x97\x75\xea\xe5\x5e\xba\x28\x6b\x97\xc4\xa3\xd4\x4c\x8f\x64\xee\xdb\x49\xad\x2d\x9b\xa2\xd4\x8c\x6e\xbb\xba\xe3\xc2\xdc\x94\xb3\xc2\x2c\xf1\x44\xcb\xe1\x05\x2d\xc3\x56\xce\x19\xae\x33\x19\x6e\xff\x8e\xd4\x28\x57\xaa\xd4\x96\x0c\x5f\x36\xea\xfe\x7d\xca\x52\x45\x13\xc6\x3f\x4c\x4d\x3d\xfb\xd1\xe7\x4a\x3d\x98\x7a\x7e\xf3\xf4\x87\xa3\x1c\xe3\xf1\x18\xf6\xb9\x6a\x92\xc0\xb7\x72\x40\x68\x13\xdc\x6e\xd7\x7e\xc0\x79\xdf\x84\x57\x38\x74\xb1\xd9\xbb\x78\xbe\x60\xc2\x6d\x92\x44\xa4\x37\xc1\xc6\xad\x93\x52\x45\xc5\x64\xae\x13\x7d\xf9\x86\x74\x31\x23\xfc\x02\xcf\xbf\x02\x00\x00\xff\xff\x39\x50\x5e\xc5\xc1\x01\x00\x00")

func _000002_add_environments_primary_key_up_sql() ([]byte, error) {
	return bindata_read(
		__000002_add_environments_primary_key_up_sql,
		"000002_add_environments_primary_key.up.sql",
	)
}

// Asset loads and returns the asset for the given name.
// It returns an error if the asset could not be found or
// could not be loaded.
func Asset(name string) ([]byte, error) {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	if f, ok := _bindata[cannonicalName]; ok {
		return f()
	}
	return nil, fmt.Errorf("Asset %s not found", name)
}

// AssetNames returns the names of the assets.
func AssetNames() []string {
	names := make([]string, 0, len(_bindata))
	for name := range _bindata {
		names = append(names, name)
	}
	return names
}

// _bindata is a table, holding each asset generator, mapped to its name.
var _bindata = map[string]func() ([]byte, error){
	"000001_create_environments_table.down.sql": _000001_create_environments_table_down_sql,
	"000001_create_environments_table.up.sql": _000001_create_environments_table_up_sql,
	"000002_add_environments_primary_key.down.sql": _000002_add_environments_primary_key_down_sql,
	"000002_add_environments_primary_key.up.sql": _000002_add_environments_primary_key_up_sql,
}
// AssetDir returns the file names below a certain
// directory embedded in the file by go-bindata.
// For example if you run go-bindata on data/... and data contains the
// following hierarchy:
//     data/
//       foo.txt
//       img/
//         a.png
//         b.png
// then AssetDir("data") would return []string{"foo.txt", "img"}
// AssetDir("data/img") would return []string{"a.png", "b.png"}
// AssetDir("foo.txt") and AssetDir("notexist") would return an error
// AssetDir("") will return []string{"data"}.
func AssetDir(name string) ([]string, error) {
	node := _bintree
	if len(name) != 0 {
		cannonicalName := strings.Replace(name, "\\", "/", -1)
		pathList := strings.Split(cannonicalName, "/")
		for _, p := range pathList {
			node = node.Children[p]
			if node == nil {
				return nil, fmt.Errorf("Asset %s not found", name)
			}
		}
	}
	if node.Func != nil {
		return nil, fmt.Errorf("Asset %s not found", name)
	}
	rv := make([]string, 0, len(node.Children))
	for name := range node.Children {
		rv = append(rv, name)
	}
	return rv, nil
}

type _bintree_t struct {
	Func func() ([]byte, error)
	Children map[string]*_bintree_t
}
var _bintree = &_bintree_t{nil, map[string]*_bintree_t{
	"000001_create_environments_table.down.sql": &_bintree_t{_000001_create_environments_table_down_sql, map[string]*_bintree_t{
	}},
	"000001_create_environments_table.up.sql": &_bintree_t{_000001_create_environments_table_up_sql, map[string]*_bintree_t{
	}},
	"000002_add_environments_primary_key.down.sql": &_bintree_t{_000002_add_environments_primary_key_down_sql, map[string]*_bintree_t{
	}},
	"000002_add_environments_primary_key.up.sql": &_bintree_t{_000002_add_environments_primary_key_up_sql, map[string]*_bintree_t{
	}},
}}
