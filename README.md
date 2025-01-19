kuromoji.js
===========

[![npm version](https://badge.fury.io/js/@leapward-koex%2Fkuromoji.svg)](https://badge.fury.io/js/@leapward-koex%2Fkuromoji)
[![Downloads](https://img.shields.io/npm/dm/@leapward-koex%2Fkuromoji)](https://www.npmjs.com/package/@leapward-koex/kuromoji)

JavaScript implementation of Japanese morphological analyzer.
This is a pure JavaScript porting of [Kuromoji](https://www.atilika.com/ja/kuromoji/).
Forked from https://npmjs.com/package/@sglkc/kuromoji with fixes for using inside an Edge extension.

You can see how kuromoji.js works in [demo site](https://takuyaa.github.io/kuromoji.js/demo/tokenize.html).


Directory
---------

Directory tree is as follows:

    build/
      kuromoji.js           -- JavaScript file for browser (Browserified)
    demo/                   -- Demo
    dict/                   -- Dictionaries for tokenizer (gzipped)
    dict_extension_spoofed/ -- Dictionaries for tokenizer with a spoofed extension for extension on Edge (gzipped) See: https://github.com/microsoft/MicrosoftEdge-Extensions/discussions/135 for more info
    example/                -- Examples to use in Node.js
    src/                    -- JavaScript source
    test/                   -- Unit test


Usage
-----

You can tokenize sentences with only 5 lines of code.
If you need working examples, you can see the files under the demo or example directory.


### Node.js

Install with npm package manager:

    npm install kuromoji

Load this library as follows:

    var kuromoji = require("kuromoji");

You can prepare tokenizer like this:

    kuromoji.builder({ dicPath: "path/to/dictionary/dir/" }).build(function (err, tokenizer) {
        // tokenizer is ready
        var path = tokenizer.tokenize("すもももももももものうち");
        console.log(path);
    });



### Browser

You only need the build/kuromoji.js and dict/*.dat.gz files

Install with Bower package manager:

    bower install kuromoji

Or you can use the kuromoji.js file and dictionary files from the GitHub repository.

In your HTML:

    <script src="url/to/kuromoji.js"></script>

In your JavaScript:

    kuromoji.builder({ dicPath: "/url/to/dictionary/dir/" }).build(function (err, tokenizer) {
        // tokenizer is ready
        var path = tokenizer.tokenize("すもももももももものうち");
        console.log(path);
    });

### Edge extension support

Edge extensions do not support shipping zip files (.gz), to get around this you can specify the names of the dictionary files to use. The library includes a copy of the dictionary with spoofed extension names under dict_extension_spoofed for convenience.

```
    kuromoji.builder({
        dicPath: "/url/to/dictionary/dir/",
        fileNameOptions: {
                            base: "base.dat.zg",
                            check: "check.dat.zg",
                            tid: "tid.dat.zg",
                            tidPos: "tid_pos.dat.zg",
                            tidMap: "tid_map.dat.zg",
                            cc: "cc.dat.zg",
                            unk: "unk.dat.zg",
                            unkPos: "unk_pos.dat.zg",
                            unkMap: "unk_map.dat.zg",
                            unkChar: "unk_char.dat.zg",
                            unkCompat: "unk_compat.dat.zg",
                            unkInvoke: "unk_invoke.dat.zg"
                        }
    }).build(function (err, tokenizer) {
        // tokenizer is ready
        var path = tokenizer.tokenize("すもももももももものうち");
        console.log(path);
    });
```

API
---

The function tokenize() returns an JSON array like this:

    [ {
        word_id: 509800,          // 辞書内での単語ID
        word_type: 'KNOWN',       // 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN)
        word_position: 1,         // 単語の開始位置
        surface_form: '黒文字',    // 表層形
        pos: '名詞',               // 品詞
        pos_detail_1: '一般',      // 品詞細分類1
        pos_detail_2: '*',        // 品詞細分類2
        pos_detail_3: '*',        // 品詞細分類3
        conjugated_type: '*',     // 活用型
        conjugated_form: '*',     // 活用形
        basic_form: '黒文字',      // 基本形
        reading: 'クロモジ',       // 読み
        pronunciation: 'クロモジ'  // 発音
      } ]

(This is defined in src/util/IpadicFormatter.js)

See also [JSDoc page](https://takuyaa.github.io/kuromoji.js/jsdoc/) in details.
