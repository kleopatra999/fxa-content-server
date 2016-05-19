/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Plugin to display hints for passwords,
 * hints change as the user types
 */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var t = BaseView.t;

  var Tooltip = require('views/tooltip');

  var TOOLTIP_MESSAGES = {
    FOCUS_PROMPT_MESSAGE: t('8 characters minimum, but longer if you plan to sync passwords.'),
    INITIAL_PROMPT_MESSAGE: t('A strong, unique password will keep your Firefox data safe from intruders.'),
    MORE_INFO_LINK: t(' <a href="" tabindex="-1" target="_blank">More info..</a>'),
    WARNING_PROMPT_MESSAGE: t('This is a common password; please consider another one.')
  };

  var PasswordPromptMixin = {
    // only the .check-password fields will be checked
    events: {
      'blur .check-password': 'onPasswordBlur',
      'focus .check-password': 'onInputFocus',
      'keyup .check-password': 'onInputKeyUp'
    },

    afterRender: function () {
      this.updateFormValueChanges();
    },

    displayInitialPrompt: function (inputEl) {
      this.$el.find(inputEl).siblings('.input-help-focused').html(TOOLTIP_MESSAGES.INITIAL_PROMPT_MESSAGE + TOOLTIP_MESSAGES.MORE_INFO_LINK);
    },

    displayPasswordPrompt: function (inputEl) {
      this.$el.find(inputEl).siblings('.input-help-focused').html(TOOLTIP_MESSAGES.FOCUS_PROMPT_MESSAGE + TOOLTIP_MESSAGES.MORE_INFO_LINK);
    },

    displayPasswordWarningPrompt: function () {
      var tooltip = new Tooltip({
        dismissible: false,
        extraClassNames: 'tooltip-suggest tooltip-warning',
        invalidEl: this.$el.find('.check-password'),
        message: TOOLTIP_MESSAGES.WARNING_PROMPT_MESSAGE + TOOLTIP_MESSAGES.MORE_INFO_LINK
      });
      tooltip.render();
    },

    showPasswordPrompt: function (inputEl) {
      var length = this.$el.find(inputEl).val().length;
      if (length === 0) {
        this.displayInitialPrompt(inputEl);
      } else {
        this.displayPasswordPrompt(inputEl);
      }
    },

    onInputFocus: function (event) {
      this.showPasswordPrompt(this.$el.find(event.currentTarget));
    },

    onInputKeyUp: function (event) {
      this.showPasswordPrompt(this.$el.find(event.currentTarget));
    },

    onPasswordBlur: function () {
      var password = this.getElementValue('.check-password');
      this.checkPasswordStrength(password);
    }

  };
  module.exports = PasswordPromptMixin;
});
