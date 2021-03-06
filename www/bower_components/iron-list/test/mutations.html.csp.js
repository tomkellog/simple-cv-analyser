suite('mutations to the collection of items', function() {
      var list, container;

      setup(function() {
        container = fixture('trivialList');
        list = container.list;
      });

      test('update physical item', function(done) {
        var setSize = 100;
        var phrase = 'It works!';

        list.items = buildDataSet(setSize);

        list.set('items.0.index', phrase);

        flush(function() {
          assert.equal(getFirstItemFromList(list).textContent, phrase);
          done();
        });
      });

      test('update virtual item', function(done) {
        var setSize = 100;
        var phrase = 'It works!';

        list.items = buildDataSet(setSize);

        function scrollBackUp() {
          simulateScroll({
            list: list,
            contribution: 200,
            target: 0,
            onScrollEnd: function() {
             assert.equal(getFirstItemFromList(list).textContent, phrase);
             done();
            }
          });
        }

        flush(function() {
          var rowHeight = getFirstItemFromList(list).offsetHeight;
          // scroll down
          simulateScroll({
            list: list,
            contribution: 200,
            target: setSize*rowHeight,
            onScrollEnd: function() {
              list.set('items.0.index', phrase);
              scrollBackUp();
            }
          });
        });
      });

      test('push', function(done) {
        var setSize = 100;

        list.items = buildDataSet(setSize);
        setSize = list.items.length;

        list.push('items', buildItem(setSize));
        assert.equal(list.items.length, setSize + 1);

        flush(function() {
          var rowHeight = list._physicalItems[0].offsetHeight;
          var viewportHeight = list.offsetHeight;
          var itemsPerViewport = Math.floor(viewportHeight/rowHeight);

          assert.equal(getFirstItemFromList(list).textContent, 0);

          simulateScroll({
            list: list,
            contribution: 200,
            target: list.items.length*rowHeight,
            onScrollEnd: function() {
              assert.equal(getFirstItemFromList(list).textContent,
                list.items.length - itemsPerViewport);
              done();
            }
          });
        })
      });

      test('push and scroll to bottom', function(done) {
        list.items = [buildItem(0)];

        flush(function() {
          var rowHeight = getFirstItemFromList(list).offsetHeight;
          var viewportHeight = list.offsetHeight;
          var itemsPerViewport = Math.floor(viewportHeight/rowHeight);

          while (list.items.length < 200) {
            list.push('items', buildItem(list.items.length));
          }

          list.scrollToIndex(list.items.length - 1);
          assert.isTrue(isFullOfItems(list));
          assert.equal(getFirstItemFromList(list).textContent.trim(),
              list.items.length - itemsPerViewport);
          done();
        });
      });

      test('pop', function(done) {
        var setSize = 100;
        list.items = buildDataSet(setSize);

        flush(function() {
          var rowHeight = getFirstItemFromList(list).offsetHeight;

          simulateScroll({
            list: list,
            contribution: 200,
            target: setSize*rowHeight,
            onScrollEnd: function() {
              var viewportHeight = list.offsetHeight;
              var itemsPerViewport = Math.floor(viewportHeight/rowHeight);

              list.pop('items');

              flush(function() {
                assert.equal(list.items.length, setSize-1);
                assert.equal(getFirstItemFromList(list).textContent, setSize - 3 - 1);
                done();
              });
            }
          });
        });
      });

      test('splice', function(done) {
        var setSize = 45;
        var phrase = 'It works!'
        list.items = buildDataSet(setSize);

        list.splice('items', 0, setSize, buildItem(phrase));

        flush(function() {
          assert.equal(list.items.length, 1);
          assert.equal(getFirstItemFromList(list).textContent, phrase);
          done();
        });
      });

      test('delete item and scroll to bottom', function() {
        var setSize = 100, index;

        list.items = buildDataSet(setSize);

        while (list.items.length > 10) {
          index = parseInt(list.items.length * Math.random());
          list.arrayDelete('items',  list.items[index]);
          list.scrollToIndex(list.items.length - 1);
          assert.isTrue(/^[0-9]*$/.test(getFirstItemFromList(list).textContent));
        }
      });

      test('reassign items', function(done) {
        list.items = buildDataSet(100);
        container.itemHeight = 'auto';

        flush(function() {
          var itemHeight = getFirstItemFromList(list).offsetHeight;
          var hasRepeatedItems = checkRepeatedItems(list);

          simulateScroll({
            list: list,
            contribution: 200,
            target: itemHeight * list.items.length,
            onScrollEnd: function() {
              list.items = list.items.slice(0);
              simulateScroll({
                list: list,
                contribution: itemHeight,
                target: itemHeight * list.items.length,
                onScroll: function() {
                  assert.isFalse(hasRepeatedItems(), 'List should not have repeated items');
                },
                onScrollEnd: done
              });
            }
          });
        });
      });

      test('empty items array', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.items = [];
          flush(function() {
            assert.notEqual(getFirstItemFromList(list).textContent, '0');
            done();
          });
        });
      });

      test('should notify path to the right physical item', function(done) {
        list.items = buildDataSet(100);
        flush(function() {
          var idx = list._physicalCount + 1;

          list.scrollToIndex(idx);
          list.notifyPath('items.1.index', 'bad');
          assert.equal(getFirstItemFromList(list).textContent, idx);
          done();
        });
      });

      test('should update items off the screen', function() {
        container.listHeight = 50;
        list.items = buildDataSet(100);
        Polymer.dom.flush();
        list.scrollToIndex(40);
        Polymer.dom.flush();
        container.listHeight = 300;
        container.fire('iron-resize');
        Polymer.dom.flush();
        list._didFocus({target: list._physicalItems[list._getPhysicalIndex(40)]});
        list.scrollToIndex(80);
        Polymer.dom.flush();
        list.set('items.40.index', 'correct');
        list.scrollToIndex(40);
        Polymer.dom.flush();
        assert.equal(getFirstItemFromList(list).textContent, 'correct');
      });
    });

    suite('mutations of primitive type items', function() {
      var container, list;

      setup(function() {
        container = fixture('trivialListPrimitiveItem');
        list = container.list;
      });

      test('push item = polymer', function(done) {
        list.items = [];
        list.push('items', 'polymer');

        flush(function() {
         assert.equal(getFirstItemFromList(list).textContent, 'polymer');
         done();
        });
      });

      test('push item = 0', function(done) {
        list.items = [];
        list.push('items', 0);

        flush(function() {
          assert.equal(getFirstItemFromList(list).textContent, '0');
          done();
        });
      });

      test('push item = false', function(done) {
        list.items = [];
        list.push('items', false);

        flush(function() {
          assert.equal(getFirstItemFromList(list).textContent, 'false');
          done();
        });
      });
    });