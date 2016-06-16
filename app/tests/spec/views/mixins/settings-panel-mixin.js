/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var KeyCodes = require('lib/key-codes');
  var Metrics = require('lib/metrics');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');

  var assert = chai.assert;

  var SettingsPanelView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);

  describe('views/mixins/settings-panel-mixin', function () {
    var view;
    var metrics;

    beforeEach(function () {
      metrics = new Metrics();

      view = new SettingsPanelView({
        metrics: metrics,
        parentView: {
          displaySuccess: sinon.spy()
        }
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    describe('events', function () {
      it('toggles button', function () {
        sinon.stub(view, 'navigate', function () { });
        $('.settings-unit-toggle').click();
        assert.isTrue(view.navigate.calledWith('settings/display_name'));
      });

      it('toggles open and closed', function () {
        sinon.stub(view, 'closePanel', function () {});
        sinon.stub(view, 'navigate', function () { });
        $('button.cancel').click();
        assert.isTrue(view.closePanel.called);
        assert.isTrue(view.navigate.calledWith('settings'));
      });
    });

    describe('methods', function () {
      it('open and close', function () {
        view.openPanel();
        assert.isTrue($('.settings-unit').hasClass('open'));
        assert.isTrue(view.isPanelOpen());
        view.closePanel();
        assert.isFalse($('.settings-unit').hasClass('open'));
        assert.isFalse(view.isPanelOpen());
      });

      it('openPanel focuses the first input field if present', function () {
        // create and append an input field
        var $dummyInput = $('<input type="text" name="dummyholder">');
        view.$('.settings-unit').append($dummyInput);
        view.openPanel();

        // input field should be present, we just appended it
        var $input = view.$('.open input:first-of-type');
        assert.isTrue($input.length === 1, 'Input field not present');
        // input field should have been focused
        assert.equal($input[0], document.activeElement, 'Input does not have focus');
      });

      it('openPanel focuses the first button field when input is not present', function () {
        // for button to be focused, input field should not be present
        var $input = $('.open input:first-of-type');
        assert.isTrue($input.length === 0, 'Input element is present');

        var $dummyButton = $('<button type="submit" class="submit primary">Subscribe</button>');
        view.$('.settings-unit').append($dummyButton);
        view.openPanel();
        // button should be present, we just appended it
        var $button = $('.open button.primary');
        assert.isTrue($button.length > 0, 'Button not found');
        // button should have been focused
        assert.equal($button[0], document.activeElement, 'Button does not have focus');
      });

      it('_hidePanelOnEscape calls hidePanel when escape key is pressed', function () {
        sinon.stub(view, 'hidePanel', function () {});
        // keycode for escape key
        view._hidePanelOnEscape(KeyCodes.ESCAPE);
        assert.isTrue(view.hidePanel.called, 'hidePanel not called');
      });

      it('_hidePanelOnEscape does not call hidePanel when other keys are pressed', function () {
        sinon.stub(view, 'hidePanel', function () {});
        // keycode for escape key
        view._hidePanelOnEscape(KeyCodes.ENTER);
        assert.isFalse(view.hidePanel.called, 'hidePanel called');
      });

      it('hidePanel hides the open panel', function () {
        sinon.stub(view, 'closePanel', function () {});
        sinon.stub(view, 'navigate', function () { });
        view.openPanel();
        view.hidePanel();
        assert.isTrue(view.closePanel.called);
        assert.isTrue(view.navigate.calledWith('settings'));
      });

      it('displaySuccess', function () {
        sinon.stub(view, 'closePanel', function () {});
        view.displaySuccess('hi');
        assert.isTrue(view.parentView.displaySuccess.calledWith('hi'));
        assert.isTrue(view.closePanel.called);
      });
    });

  });
});

