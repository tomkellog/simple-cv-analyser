suite('<iron-image>', function() {
        function randomImageUrl () {
          return '../demo/polymer.svg?' + Math.random();
        }

        var image;

        suite('basic behavior', function() {
          setup(function() {
            image = fixture('TrivialImage');
          });

          test('loading, loaded, error are false before any src is set', function() {
            expect(image.loading).to.be.eql(false);
            expect(image.loaded).to.be.eql(false);
            expect(image.error).to.be.eql(false);
          });

          test('loading, loaded, error are false when src is set to empty string', function(done) {
            image.addEventListener('loaded-changed', function onLoadedChanged() {
              if (image.loaded) {
                image.removeEventListener('loaded-changed', onLoadedChanged);
                image.addEventListener('loaded-changed', function onLoadedChanged2() {
                  image.removeEventListener('loaded-changed', onLoadedChanged2);

                  expect(image.loading).to.be.eql(false);
                  expect(image.loaded).to.be.eql(false);
                  expect(image.error).to.be.eql(false);
                  done();
                });

                expect(image.loading).to.be.eql(false);
                expect(image.loaded).to.be.eql(true);
                expect(image.error).to.be.eql(false);
                image.src = '';
              }
            });
            image.src = randomImageUrl();
          });

          test('can load images given a src', function(done) {
            image.addEventListener('loaded-changed', function onLoadedChanged() {
              image.removeEventListener('loaded-changed', onLoadedChanged);

              try {
                expect(image.loaded).to.be.eql(true);
                done();
              } catch (e) {
                done(e);
              }
            });
            image.src = randomImageUrl();
          });

          test('will reload images when src changes', function(done) {
            var loadCount = 0;

            image.addEventListener('loaded-changed', function onLoadedChanged() {
              if (image.loaded === true) {
                loadCount++;

                if (loadCount === 2) {
                  image.removeEventListener('loaded-changed', onLoadedChanged);
                  done();
                } else {
                  image.src = randomImageUrl();
                }
              }
            });

            image.src = randomImageUrl();
          });

          test('error property is set when the image fails to load', function(done) {
            image.addEventListener('error-changed', function onErrorChanged() {
              assert(image.error, 'image has error property set');
              image.removeEventListener('error-changed', onErrorChanged);
              done();
            });

            image.src = '/this_image_should_not_exist.jpg';
          });

          // Test for PolymerElements/iron-image#16.
          test('placeholder is hidden after loading when src is changed from invalid to valid', function(done) {
            image.preload = true;

            image.addEventListener('error-changed', function onErrorChanged() {
              image.removeEventListener('error-changed', onErrorChanged);

              assert.equal(image.loading, false, 'errored image loading = false');
              assert.equal(image.loaded, false, 'errored image loaded = false');
              assert.equal(image.error, true, 'errored image error = true');

              image.addEventListener('loaded-changed', function onLoadedChanged() {
                if (!image.loaded) return;

                image.removeEventListener('loaded-changed', onLoadedChanged);

                assert.equal(image.loading, false, 'ok image loading = false');
                assert.equal(image.loaded, true, 'ok image loaded = true');
                assert.equal(image.error, false, 'ok image error = false');
                assert.equal(getComputedStyle(image.$.placeholder).display, 'none', 'placeholder has style.display = none');

                done();
              });

              image.src = randomImageUrl();
            });

            image.src = '/this_image_should_not_exist.jpg';
          });

          // Test for PolymerElements/iron-image#23.
          test('image is not shown below placeholder if previous image was loaded with' +
               ' sizing on and current image fails to load', function(done) {
            image.preload = true;
            image.sizing = 'cover';

            image.addEventListener('loaded-changed', function onLoadedChanged() {
              if (!image.loaded) return;
              image.removeEventListener('loaded-changed', onLoadedChanged);

              assert.notEqual(getComputedStyle(image.$.sizedImgDiv).backgroundImage, 'none', 'image visible after successful load');
              assert.equal(getComputedStyle(image.$.placeholder).display, 'none', 'placeholder hidden after successful load');

              image.addEventListener('error-changed', function onErrorChanged() {
                if (!image.error) return;
                image.removeEventListener('error-changed', onErrorChanged);

                assert.equal(getComputedStyle(image.$.sizedImgDiv).backgroundImage, 'none', 'image hidden after failed load');
                assert.notEqual(getComputedStyle(image.$.placeholder).display, 'none', 'placeholder visible after failed load');

                done();
              });

              image.src = '/this_image_should_not_exist.jpg';
            });

            image.src = randomImageUrl();
          });
        });

        suite('--iron-image-width, --iron-image-height', function() {
          var fixedWidthContainer;
          var fixedWidthIronImage;
          var fixedHeightContainer;
          var fixedHeightIronImage;

          setup(function() {
            fixedWidthContainer = fixture('FixedWidthContainer');
            fixedWidthIronImage = fixedWidthContainer.querySelector('iron-image');
            fixedHeightContainer = fixture('FixedHeightContainer');
            fixedHeightIronImage = fixedHeightContainer.querySelector('iron-image');
          });

          test('100% width image fills container', function(done) {
            fixedWidthIronImage.$.img.addEventListener('load', function onLoadedChanged(e) {
              fixedWidthIronImage.$.img.removeEventListener('load', onLoadedChanged);
              Polymer.updateStyles();

              var containerRect = fixedWidthContainer.getBoundingClientRect();
              var ironImageRect = fixedWidthIronImage.getBoundingClientRect();
              var wrappedImageRect = fixedWidthIronImage.$.img.getBoundingClientRect();

              expect(containerRect.width).to.be.closeTo(500, 0.5);
              expect(ironImageRect.width).to.be.closeTo(500, 0.5);
              expect(wrappedImageRect.width).to.be.closeTo(500, 0.5);

              done();
            });

            fixedWidthIronImage.src = randomImageUrl();
          });

          test('100% height image fills container', function(done) {
            fixedHeightIronImage.$.img.addEventListener('load', function onLoadedChanged(e) {
              fixedHeightIronImage.$.img.removeEventListener('load', onLoadedChanged);
              Polymer.updateStyles();

              var containerRect = fixedHeightContainer.getBoundingClientRect();
              var ironImageRect = fixedHeightIronImage.getBoundingClientRect();
              var wrappedImageRect = fixedHeightIronImage.$.img.getBoundingClientRect();

              expect(containerRect.height).to.be.closeTo(500, 0.5);
              expect(ironImageRect.height).to.be.closeTo(500, 0.5);
              expect(wrappedImageRect.height).to.be.closeTo(500, 0.5);

              done();
            });

            fixedHeightIronImage.src = randomImageUrl();
          });
        });

        suite('accessibility', function() {
          suite('sizing inactive', function() {
            var image;

            setup(function() {
              image = fixture('TrivialImage');
            });

            test('#sizedImgDiv is hidden', function() {
              var sizedImgDivStyle = window.getComputedStyle(image.$.sizedImgDiv);
              assert.strictEqual(sizedImgDivStyle.display, 'none');
            });

            test('img has no alt text by default', function() {
              assert.isFalse(image.$.img.hasAttribute('alt'));
            });

            test('img alt text is empty string when iron-image alt text is empty string', function() {
              image.alt = '';

              assert.isTrue(image.$.img.hasAttribute('alt'));
              assert.strictEqual(image.$.img.getAttribute('alt'), '');
            });

            test('img alt text matches iron-image alt text when defined', function() {
              image.alt = 'alt text value';

              assert.isTrue(image.$.img.hasAttribute('alt'));
              assert.strictEqual(image.$.img.getAttribute('alt'), 'alt text value');
            });
          });

          suite('sizing active', function() {
            var image;

            setup(function() {
              image = fixture('TrivialImage');
              image.sizing = 'cover';
            });

            test('inner img is hidden', function() {
              var imgStyle = window.getComputedStyle(image.$.img);
              assert.strictEqual(imgStyle.display, 'none');
            });

            test('#sizedImgDiv has empty aria-label text by default', function() {
              assert.isTrue(image.$.sizedImgDiv.hasAttribute('aria-label'));
              assert.strictEqual(image.$.sizedImgDiv.getAttribute('aria-label'), '');
            });

            test('#sizedImgDiv has aria-hidden when iron-image alt text is empty string', function() {
              image.alt = '';

              assert.isTrue(image.$.sizedImgDiv.hasAttribute('aria-hidden'));
              var hiddenValue = image.$.sizedImgDiv.getAttribute('aria-hidden');
              assert.isTrue(hiddenValue === '' || hiddenValue === 'true');
            });

            test('#sizedImgDiv aria-label matches iron-image alt text when defined', function() {
              image.alt = 'alt text value';

              assert.isTrue(image.$.sizedImgDiv.hasAttribute('aria-label'));
              assert.strictEqual(image.$.sizedImgDiv.getAttribute('aria-label'), 'alt text value');
            });

            test('#sizedImgDiv aria-label text is last path component of src when iron-image alt text is undefined', function() {
              image.src = '/some/path.components/file.jpg?a=b&c=d#anchor';

              assert.isTrue(image.$.sizedImgDiv.hasAttribute('aria-label'));
              assert.strictEqual(image.$.sizedImgDiv.getAttribute('aria-label'), 'file.jpg');
            });
          });
        });
      });