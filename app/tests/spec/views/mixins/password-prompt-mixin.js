/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var PasswordPromptMixin = require('views/mixins/password-prompt-mixin');
  var PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  var sinon = require('sinon');

  var FormView = require('views/form');
  var Template = require('stache!templates/test_template');

  var TestView = FormView.extend({
    template: Template
  });

  Cocktail.mixin(
    TestView,
    PasswordPromptMixin,
    PasswordStrengthMixin
  );

  var TOOLTIP_MESSAGES = {
    FOCUS_PROMPT_MESSAGE: '8 characters minimum, but longer if you plan to sync passwords.',
    INITIAL_PROMPT_MESSAGE: 'A strong, unique password will keep your Firefox data safe from intruders.',
    MORE_INFO_LINK: ' <a href="" tabindex="-1" target="_blank">More info..</a>',
    WARNING_PROMPT_MESSAGE: 'This is a common password; please consider another one.'
  };
  var PASSWORD_FIELD_SELECTOR = '.check-password';
  var TOOLTIP_SELECTOR = '.tooltip-warning';

  var assert = chai.assert;

  describe('views/mixins/password-prompt-mixin', function () {
    var view;

    describe('showPasswordPrompt displays different prompts', function () {
      beforeEach(function () {
        view = new TestView();
        return view.render();
      });

      it('displays the initial password prompt when password field is empty', function () {
        var password = '';
        view.$(PASSWORD_FIELD_SELECTOR).val(password);
        view.showPasswordPrompt(PASSWORD_FIELD_SELECTOR);
        assert.equal(view.$(PASSWORD_FIELD_SELECTOR).siblings('.input-help-focused').html(),
          TOOLTIP_MESSAGES.INITIAL_PROMPT_MESSAGE + TOOLTIP_MESSAGES.MORE_INFO_LINK);
      });

      it('displays the focused password prompt when password field is not empty', function () {
        var password = 's';
        view.$(PASSWORD_FIELD_SELECTOR).val(password);
        view.showPasswordPrompt(PASSWORD_FIELD_SELECTOR);
        assert.equal(view.$(PASSWORD_FIELD_SELECTOR).siblings('.input-help-focused').html(),
          TOOLTIP_MESSAGES.FOCUS_PROMPT_MESSAGE + TOOLTIP_MESSAGES.MORE_INFO_LINK);
      });
    });

    describe('event triggers call the correct methods', function () {
      beforeEach(function () {
        view = new TestView();
        sinon.spy(view, 'showPasswordPrompt');
        return view.render();
      });

      it('onInputFocus calls showPasswordPrompt with the right password field', function () {
        var event = new $.Event('focus');
        event.currentTarget = PASSWORD_FIELD_SELECTOR;
        view.onInputFocus(event);
        assert.isTrue(view.showPasswordPrompt.calledWith(view.$(PASSWORD_FIELD_SELECTOR)));
      });

      it('onInputKeyUp calls showPasswordPrompt with the right password field', function () {
        var event = new $.Event('keyup');
        event.currentTarget = PASSWORD_FIELD_SELECTOR;
        view.onInputKeyUp(event);
        assert.isTrue(view.showPasswordPrompt.calledWith(view.$(PASSWORD_FIELD_SELECTOR)));
      });
    });

    describe('checks password strength and displays tooltip if required', function () {
      beforeEach(function () {
        view = new TestView();
        return view.render();
      });

      it('calls checkPasswordStrength with the right password', function () {
        var password = 'charlie2';
        view.$(PASSWORD_FIELD_SELECTOR).val(password);
        sinon.stub(view, 'checkPasswordStrength', function (password) {
          // do nothing
        });
        view.onPasswordBlur();
        assert.isTrue(view.checkPasswordStrength.calledWith('charlie2'));
      });

      it('displays tooltip when password is weak', function (done) {
        var password = 'charlie2';
        view.$(PASSWORD_FIELD_SELECTOR).val(password);
        sinon.stub(view, 'checkPasswordStrength', function (password) {
          view.displayPasswordWarningPrompt();
        });
        view.onPasswordBlur();
        // wait for tooltip
        setTimeout(function () {
          assert.equal(view.$(TOOLTIP_SELECTOR).length, 1);
          done();
        }, 50);
      });

      it('does not display tooltip when password is strong', function (done) {
        var password = 'imstronglol';
        view.$(PASSWORD_FIELD_SELECTOR).val(password);
        sinon.stub(view, 'checkPasswordStrength', function (password) {
          // do nothing
        });
        view.onPasswordBlur();
        // wait for tooltip
        setTimeout(function () {
          assert.equal(view.$(TOOLTIP_SELECTOR).length, 0);
          done();
        }, 50);
      });
    });

  });
});
