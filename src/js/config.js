jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';

  const tbody = $('.object-table');
  const submitButton = $('.js-save-buton');
  const cancelButton = $('.js-cancel-button');

  const createElement = function(value) {
    var input = $('<input>', {
      type: "text",
      "class": "kintoneplugin-input-text"
    }).val(value);
    var td = $('<td></td>').append($('<div></div>', {
      "class": "kintoneplugin-table-td-control"
    }).append($('<div></div>', {
      "class": "kintoneplugin-table-td-control-value"
    }).append($('<div></div>', {
      "class": "kintoneplugin-input-outer"
    }).append(input))));
    return td;
  }

  const createButton = function(tr) {
    var td = $('<td></td>', {
      "class": "kintoneplugin-table-td-operation"
    }).append($('<button></button>', {
      type: "button",
      title: "add row",
      "class": "kintoneplugin-button-add-row-image",
      on: {
        click: function() {
          // add
          var number = $("table tbody tr").length;
          if (number >= 20) {
            Swal.fire("これ以上追加できません", "保存できる環境変数は20個までです。", "warning");
          } else {
            tr.after(createRow(null, null));
          }
        }
      }
    })).append($('<button></button>', {
      type: "button",
      title: "delete row",
      "class": "kintoneplugin-button-remove-row-image",
      on: {
        click: function() {
          // remove
          var number = $("table tbody tr").length;
          if (number > 1) {
            tr.remove();
          }
        }
      }
    }));
    return td;
  }

  const createRow = function(key, val) {
    var row = $('<tr></tr>');
    row.append(createElement(key));
    row.append(createElement(val));
    row.append(createButton(row));
    return row;
  }

  function getValue(element) {
    var value = element.firstElementChild.firstElementChild.firstElementChild.firstElementChild.value;
    return value;
  }

  const onLoad = function() {
    $('.app-id').text(`PLUGIN_ID:${PLUGIN_ID}`);
    let config = kintone.plugin.app.getConfig(PLUGIN_ID);
    console.log(config);
    if (config) {
      var keys = Object.keys(config);
      if (keys.length === 0) tbody.append(createRow(null, null));
      keys.forEach(function(key) {
        var row = createRow(key, config[key]);
        tbody.append(row);
      });
    }

    // on click
    submitButton.on('click', function() {
      const checkValue = new Promise(function(resolve, reject) {
        let config = {};
        let list = $(".object-table tr");
        list.each(function(index, element) {
          var children = element.children;
          var key = getValue(children[0]);
          var val = getValue(children[1]);
          if (key && val) {
            config[key] = val;
          } else if (key || val) {
            reject(true);
            return false;
          }
        });
        resolve(config);
      });

      checkValue.then(function(resp) {
        console.log(resp);
        if (resp) {
          kintone.plugin.app.setConfig(resp, function() {
            Swal.fire('保存しました', '環境変数を保存しました。', 'success').then(function(result) {
              window.location.href = '../../' + kintone.app.getId() + '/plugin/';
            });
          });
        }
      }).catch(function(err) {
        if (err) {
          Swal.fire("入力不備があります", "keyもしくはvalueに空白があります。", "error");
        } else {
          Swal.fire("最大文字数を超えています", "valueの合計が256KBを超えています", "error");
        }
      });
    });
    cancelButton.on('click', function() {
      window.location.href = '../../' + kintone.app.getId() + '/plugin/';
    });
  }

  onLoad();

})(jQuery, kintone.$PLUGIN_ID);
