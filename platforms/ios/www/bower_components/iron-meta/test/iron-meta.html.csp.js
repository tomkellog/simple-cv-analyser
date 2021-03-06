suite('<iron-meta>', function () {
  suite('basic behavior', function () {
    var meta;

    setup(function () {
      meta = fixture('TrivialMeta');
    });

    teardown(function () {
      meta.key = null;
    });

    test('uses itself as the default value', function () {
      expect(meta.value).to.be.equal(meta);
    });

    test('can be assigned alternative values', function () {
      meta.value = 'foobar';

      expect(meta.list[0]).to.be.equal('foobar');
    });

    test('can access same-type meta values by key', function () {
      expect(meta.byKey(meta.key)).to.be.equal(meta.value);
    });

    test('yields a list of same-type meta data', function () {
      expect(meta.list).to.be.ok;
      expect(meta.list.length).to.be.equal(1);
      expect(meta.list[0]).to.be.equal(meta);
    });
  });

  suite('many same-typed metas', function () {
    var metas;

    setup(function () {
      metas = fixture('ManyMetas');
    });

    teardown(function () {
      metas.forEach(function (meta) {
        meta.key = null;
      });
    });

    test('all cache all meta values', function () {
      metas.forEach(function (meta, index) {
        expect(meta.list.length).to.be.equal(metas.length);
        expect(meta.list[index].value).to.be.equal(meta.value);
      });
    });

    test('can be unregistered individually', function () {
      metas[0].key = null;

      expect(metas[0].list.length).to.be.equal(2);
      expect(metas[0].list).to.be.deep.equal([metas[1], metas[2]])
    });

    test('can access each others value by key', function () {
      expect(metas[0].byKey('default2')).to.be.equal(metas[1].value);
    });
  });

  suite('different-typed metas', function () {
    var metas;

    setup(function () {
      metas = fixture('DifferentTypedMetas');
    });

    teardown(function () {
      metas.forEach(function (meta) {
        meta.key = null;
      });
    });

    test('cache their values separately', function () {
      var fooMeta = metas[0];
      var barMeta = metas[1];

      expect(fooMeta.value).to.not.be.equal(barMeta.value);
      expect(fooMeta.byKey('foobarKey')).to.be.equal(fooMeta.value);
      expect(barMeta.byKey('foobarKey')).to.be.equal(barMeta.value);
    });

    test('cannot access values of other types', function () {
      var defaultMeta = metas[2];

      expect(defaultMeta.byKey('foobarKey')).to.be.equal(undefined);
    });

    test('only list values of their type', function () {
      metas.forEach(function (meta) {
        expect(meta.list.length).to.be.equal(1);
        expect(meta.list[0]).to.be.equal(meta.value);
      })
    });
  });

  suite('metas with clashing keys', function () {
    var metaPair;

    setup(function () {
      metaPair = fixture('ClashingMetas');
    });

    teardown(function () {
      metaPair.forEach(function (meta) {
        meta.key = null;
      });
    });

    test('let the last value win registration against the key', function () {
      var registeredValue = metaPair[0].byKey(metaPair[0].key);
      var firstValue = metaPair[0].value;
      var secondValue = metaPair[1].value;

      expect(registeredValue).to.not.be.equal(firstValue);
      expect(registeredValue).to.be.equal(secondValue);
    });
  });

  suite('singleton', function () {

    test('only one ironmeta created', function () {
      var first = Polymer.IronMeta.getIronMeta();
      var second = Polymer.IronMeta.getIronMeta();
      expect(first).to.be.equal(second);
    });
  });
});