/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var async = require("async");
var DynamicDictionaries = require("../dict/DynamicDictionaries");

/**
 * @typedef {Object} DictionaryFileNames
 * @property {string} [base="base.dat.gz"]
 * @property {string} [check="check.dat.gz"]
 * @property {string} [tid="tid.dat.gz"]
 * @property {string} [tidPos="tid_pos.dat.gz"]
 * @property {string} [tidMap="tid_map.dat.gz"]
 * @property {string} [cc="cc.dat.gz"]
 * @property {string} [unk="unk.dat.gz"]
 * @property {string} [unkPos="unk_pos.dat.gz"]
 * @property {string} [unkMap="unk_map.dat.gz"]
 * @property {string} [unkChar="unk_char.dat.gz"]
 * @property {string} [unkCompat="unk_compat.dat.gz"]
 * @property {string} [unkInvoke="unk_invoke.dat.gz"]
 */

/**
 * DictionaryLoader constructor
 * @param {string} dic_path Path to the dictionary folder
 * @param {DictionaryFileNames} [fileOptions] Optional overriding file names
 * @constructor
 */
function DictionaryLoader(dic_path, fileOptions) {
    this.dic = new DynamicDictionaries();
    this.dic_path = dic_path;

    // Default file names with ability to override via fileOptions
    this.fileNames = {
        base: fileOptions?.base || "base.dat.gz",
        check: fileOptions?.check || "check.dat.gz",
        tid: fileOptions?.tid || "tid.dat.gz",
        tidPos: fileOptions?.tidPos || "tid_pos.dat.gz",
        tidMap: fileOptions?.tidMap || "tid_map.dat.gz",
        cc: fileOptions?.cc || "cc.dat.gz",
        unk: fileOptions?.unk || "unk.dat.gz",
        unkPos: fileOptions?.unkPos || "unk_pos.dat.gz",
        unkMap: fileOptions?.unkMap || "unk_map.dat.gz",
        unkChar: fileOptions?.unkChar || "unk_char.dat.gz",
        unkCompat: fileOptions?.unkCompat || "unk_compat.dat.gz",
        unkInvoke: fileOptions?.unkInvoke || "unk_invoke.dat.gz",
    };
}

DictionaryLoader.prototype.loadArrayBuffer = function (file, callback) {
    throw new Error("DictionaryLoader#loadArrayBuffer should be overwritten");
};

/**
 * Load dictionary files
 * @param {DictionaryLoader~onLoad} load_callback Callback function called after loading
 */
DictionaryLoader.prototype.load = function (load_callback) {
    var dic = this.dic;
    var dic_path = this.dic_path;
    var loadArrayBuffer = this.loadArrayBuffer;
    var fileNames = this.fileNames;

    var dic_path_url = function (filename) {
        var separator = '/';
        var replace = new RegExp(separator + '{1,}', 'g');
        return [dic_path, filename].join(separator).replace(replace, separator);
    };

    async.parallel([
        // Trie
        function (callback) {
            async.map([fileNames.base, fileNames.check], function (filename, _callback) {
                loadArrayBuffer(dic_path_url(filename), function (err, buffer) {
                    if (err) return _callback(err);
                    _callback(null, buffer);
                });
            }, function (err, buffers) {
                if (err) return callback(err);
                var base_buffer = new Int32Array(buffers[0]);
                var check_buffer = new Int32Array(buffers[1]);
                dic.loadTrie(base_buffer, check_buffer);
                callback(null);
            });
        },
        // Token info dictionaries
        function (callback) {
            async.map([fileNames.tid, fileNames.tidPos, fileNames.tidMap], function (filename, _callback) {
                loadArrayBuffer(dic_path_url(filename), function (err, buffer) {
                    if (err) return _callback(err);
                    _callback(null, buffer);
                });
            }, function (err, buffers) {
                if (err) return callback(err);
                var token_info_buffer = new Uint8Array(buffers[0]);
                var pos_buffer = new Uint8Array(buffers[1]);
                var target_map_buffer = new Uint8Array(buffers[2]);
                dic.loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer);
                callback(null);
            });
        },
        // Connection cost matrix
        function (callback) {
            loadArrayBuffer(dic_path_url(fileNames.cc), function (err, buffer) {
                if (err) return callback(err);
                var cc_buffer = new Int16Array(buffer);
                dic.loadConnectionCosts(cc_buffer);
                callback(null);
            });
        },
        // Unknown dictionaries
        function (callback) {
            async.map([
                fileNames.unk,
                fileNames.unkPos,
                fileNames.unkMap,
                fileNames.unkChar,
                fileNames.unkCompat,
                fileNames.unkInvoke
            ], function (filename, _callback) {
                loadArrayBuffer(dic_path_url(filename), function (err, buffer) {
                    if (err) return _callback(err);
                    _callback(null, buffer);
                });
            }, function (err, buffers) {
                if (err) return callback(err);
                var unk_buffer = new Uint8Array(buffers[0]);
                var unk_pos_buffer = new Uint8Array(buffers[1]);
                var unk_map_buffer = new Uint8Array(buffers[2]);
                var cat_map_buffer = new Uint8Array(buffers[3]);
                var compat_cat_map_buffer = new Uint32Array(buffers[4]);
                var invoke_def_buffer = new Uint8Array(buffers[5]);
                dic.loadUnknownDictionaries(
                    unk_buffer,
                    unk_pos_buffer,
                    unk_map_buffer,
                    cat_map_buffer,
                    compat_cat_map_buffer,
                    invoke_def_buffer
                );
                callback(null);
            });
        }
    ], function (err) {
        load_callback(err, dic);
    });
};

/**
 * Callback
 * @callback DictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {DynamicDictionaries} dic Loaded dictionary
 */

module.exports = DictionaryLoader;
