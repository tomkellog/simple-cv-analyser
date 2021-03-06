suite('basic', function() {

      test('id generated on creation', function() {
        var e = document.createElement('iron-label');
        assert(e.id, 'iron-label-0');
      });

      test('id not overwritten if given', function() {
        var label = fixture('ExplicitId');
        assert.equal(label.id, 'explicit', 'explict id is kept');
      });

      test('ids are unique', function() {
        var labels = fixture('UniqueIds');
        assert.notEqual(labels[0].id, labels[1].id);
      });

      a11ySuite('TrivialWrapper');
      a11ySuite('MultiElementWrapper');
      a11ySuite('ExplicitId');
      a11ySuite('TrivialSelector');

    });

    suite('targeting', function() {

      function expectedTarget(expected, label) {
        assert.ok(expected, 'expected is defined');
        assert.ok(label, 'label is defined');
        var actual = label._findTarget();
        assert.equal(actual, expected, 'target is expected');
        assert.ok(expected.hasAttribute('aria-labelledby'), 'has aria labelledby');
        assert.equal(expected.getAttribute('aria-labelledby'), label.id, 'aria-labelledby points to iron-label');
        if (label.for) {
          assert.equal(label.getAttribute('for'), label.for, 'for property reflected');
        }
      }

      test('Trivial', function() {
        var label = fixture('TrivialWrapper');
        var expected = Polymer.dom(label).firstElementChild;
        expectedTarget(expected, label);
      });

      test('Multiple', function() {
        var label = fixture('MultiElementWrapper');
        var expected = Polymer.dom(label).querySelector('[iron-label-target]');
        expectedTarget(expected, label);
      });

      test('selected target via selector', function() {
        var container = fixture('TrivialSelector');
        var label = Polymer.dom(container).firstElementChild;
        var expected = label.nextElementSibling;
        expectedTarget(expected, label);
      });

    });

    suite('dynamic targeting', function() {
      var container, label, nested, one;

      setup(function() {
        container = fixture('DynamicLabel');
        label = Polymer.dom(container).querySelector('#label');
        nested = Polymer.dom(label).firstElementChild;
        one = Polymer.dom(container).querySelector('#one');
      });

      test('nested is target', function() {
        assert.equal(nested.getAttribute('aria-labelledby'), label.id);
        assert.notOk(one.hasAttribute('aria-labelledby'));
      });

      test('nested -> #one', function() {
        label.for = 'one';
        assert.equal(one.getAttribute('aria-labelledby'), label.id);
        assert.notOk(nested.hasAttribute('aria-labelledby'));
      });

    });