(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/booking/booking"],{

/***/ 86:
/*!****************************************************************************!*\
  !*** D:/山羊goat项目/网球场馆小程序_uni/main.js?{"page":"pages%2Fbooking%2Fbooking"} ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _booking = _interopRequireDefault(__webpack_require__(/*! ./pages/booking/booking.vue */ 87));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_booking.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 87:
/*!*********************************************************!*\
  !*** D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./booking.vue?vue&type=template&id=54bc03ba& */ 88);
/* harmony import */ var _booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./booking.vue?vue&type=script&lang=js& */ 90);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./booking.vue?vue&type=style&index=0&lang=css& */ 92);
/* harmony import */ var _HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 37);

var renderjs





/* normalize component */

var component = Object(_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["render"],
  _booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null,
  false,
  _booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/booking/booking.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 88:
/*!****************************************************************************************!*\
  !*** D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue?vue&type=template&id=54bc03ba& ***!
  \****************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./booking.vue?vue&type=template&id=54bc03ba& */ 89);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_template_id_54bc03ba___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 89:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue?vue&type=template&id=54bc03ba& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var g0 = _vm.courtList.length
  var g1 = g0 ? _vm.courtList.length : null
  var g2 = _vm.courtList.length && _vm.hasOpenSlots
  var l1 = g2
    ? _vm.__map(_vm.courtList, function (court, __i0__) {
        var $orig = _vm.__get_orig(court)
        var l0 = _vm.__map(court.times, function (cell, i) {
          var $orig = _vm.__get_orig(cell)
          var m0 = _vm.cls(cell)
          return {
            $orig: $orig,
            m0: m0,
          }
        })
        return {
          $orig: $orig,
          l0: l0,
        }
      })
    : null
  var g3 = !g2 ? _vm.courtList.length : null
  var g4 =
    _vm.cardSheetVisible &&
    _vm.currentPrice > 0 &&
    _vm.walletBalance + 0.001 >= _vm.currentPrice
      ? Number(_vm.walletBalance).toFixed(2)
      : null
  var g5 =
    _vm.cardSheetVisible &&
    _vm.currentPrice > 0 &&
    !(_vm.walletBalance + 0.001 >= _vm.currentPrice)
      ? Number(_vm.walletBalance).toFixed(2)
      : null
  var l2 = _vm.cardSheetVisible
    ? _vm.__map(_vm.usableCards, function (c, __i1__) {
        var $orig = _vm.__get_orig(c)
        var m1 = _vm.cardMeta(c)
        return {
          $orig: $orig,
          m1: m1,
        }
      })
    : null
  var g6 = _vm.cardSheetVisible
    ? !_vm.cardLoading && _vm.usableCards.length === 0
    : null
  if (!_vm._isMounted) {
    _vm.e0 = function ($event) {
      _vm.noticeVisible = false
    }
    _vm.e1 = function ($event) {
      _vm.cardSheetVisible = false
    }
    _vm.e2 = function ($event) {
      _vm.cardSheetVisible = false
    }
    _vm.e3 = function ($event) {
      _vm.venueSheetVisible = false
    }
    _vm.e4 = function ($event) {
      _vm.venueSheetVisible = false
    }
  }
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        g0: g0,
        g1: g1,
        g2: g2,
        l1: l1,
        g3: g3,
        g4: g4,
        g5: g5,
        l2: l2,
        g6: g6,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 90:
/*!**********************************************************************************!*\
  !*** D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./booking.vue?vue&type=script&lang=js& */ 91);
/* harmony import */ var _HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 91:
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ 13));
var AppTabbar = function AppTabbar() {
  __webpack_require__.e(/*! require.ensure | components/app-tabbar */ "components/app-tabbar").then((function () {
    return resolve(__webpack_require__(/*! @/components/app-tabbar.vue */ 190));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = {
  components: {
    AppTabbar: AppTabbar
  },
  data: function data() {
    return {
      nickName: '',
      courtConfig: [],
      hasPickleball: false,
      dateList: [],
      venueName: '',
      venueId: '',
      venueList: [],
      sport: 'tennis',
      venueSheetVisible: false,
      courtList: [],
      currentDate: '',
      currentCourtId: '',
      currentCourtName: '',
      currentTime: '',
      booking: false,
      notice: null,
      noticeVisible: false,
      cardSheetVisible: false,
      cardLoading: false,
      myCards: [],
      selectedCardId: '',
      payWay: 'wx',
      walletBalance: 0,
      priceMap: {},
      allTimes: [{
        time: '08:00-09:00',
        short: '08:00',
        hour: 8
      }, {
        time: '09:00-10:00',
        short: '09:00',
        hour: 9
      }, {
        time: '10:00-11:00',
        short: '10:00',
        hour: 10
      }, {
        time: '11:00-12:00',
        short: '11:00',
        hour: 11
      }, {
        time: '14:00-15:00',
        short: '14:00',
        hour: 14
      }, {
        time: '15:00-16:00',
        short: '15:00',
        hour: 15
      }, {
        time: '16:00-17:00',
        short: '16:00',
        hour: 16
      }, {
        time: '17:00-18:00',
        short: '17:00',
        hour: 17
      }, {
        time: '18:00-19:00',
        short: '18:00',
        hour: 18
      }, {
        time: '19:00-20:00',
        short: '19:00',
        hour: 19
      }, {
        time: '20:00-21:00',
        short: '20:00',
        hour: 20
      }, {
        time: '21:00-22:00',
        short: '21:00',
        hour: 21
      }]
    };
  },
  computed: {
    hasOpenSlots: function hasOpenSlots() {
      var list = this.courtList || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].times && list[i].times.length) return true;
      }
      return false;
    },
    emptyHint: function emptyHint() {
      if (!this.venueId) return '请先在首页选择场馆';
      if (this.sport === 'pickleball') return '当前门店没有匹克球场地';
      if (!(this.courtConfig && this.courtConfig.length)) return '当前门店暂无可预约场地（场地可能尚未开放）';
      return '当前门店没有可预约的网球场地';
    },
    currentPrice: function currentPrice() {
      if (!this.currentCourtName || !this.currentTime) return 0;
      return this.lookupPrice(this.currentCourtName, this.currentTime);
    },
    usableCards: function usableCards() {
      var that = this;
      return (this.myCards || []).filter(function (c) {
        var typ = String(c.type || '');
        var name = String(c.cardName || c.card_name || '');
        if (typ === 'stored' || typ === '储值' || typ === 'wallet' || name.indexOf('储值') >= 0) return false;
        return that.isCardUsable(c, that.currentDate, that.currentTime);
      });
    },
    noUsableCardText: function noUsableCardText() {
      var court = this.lookupCurrentCourt();
      if (this.isPureTennisCourt(court) && this.hasMachineOnlyCards()) {
        return '这块场已标为纯网球、没有发球机，发球机卡不能约';
      }
      return '暂无可用次卡或期限卡，可用现金余额或微信支付';
    },
    activeCourt: function activeCourt() {
      var name = this.currentCourtName;
      var list = this.courtList || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].name === name) return list[i];
      }
      return list[0] || {
        id: '',
        name: '',
        times: []
      };
    },
    activeTimes: function activeTimes() {
      return this.activeCourt && this.activeCourt.times || [];
    }
  },
  onLoad: function onLoad() {
    this.nickName = uni.getStorageSync('nickName') || '';
    this.loadCourts();
    this.initDateList();
  },
  onShow: function onShow() {
    try {
      uni.hideTabBar({
        animation: false
      });
    } catch (e) {}
    this.nickName = uni.getStorageSync('nickName') || '';
    this.venueName = uni.getStorageSync('venue_name') || '';
    this.venueId = uni.getStorageSync('venue_id') || '';
    this.ensureBookableVenue();
  },
  methods: {
    normCourt: function normCourt(c) {
      return String(c || '').trim().replace(/^\u53D1\u7403\u673A/, '').replace(/\u573A$/, '');
    },
    slotKey: function slotKey(court, time) {
      return this.normCourt(court) + '_' + String(time || '');
    },
    lookupPrice: function lookupPrice(courtName, time) {
      var direct = Number(this.priceMap[courtName + '_' + time] || 0);
      if (direct) return direct;
      var keys = Object.keys(this.priceMap || {});
      var want = this.normCourt(courtName);
      for (var k = 0; k < keys.length; k++) {
        if (keys[k].indexOf(time) < 0) continue;
        var courtKey = keys[k].split('_')[0];
        if (courtKey === courtName || this.normCourt(courtKey) === want || courtName.indexOf(courtKey) >= 0 || courtKey.indexOf(courtName) >= 0) {
          var price = Number(this.priceMap[keys[k]] || 0);
          if (price) return price;
        }
      }
      return 0;
    },
    cls: function cls(cell) {
      var off = cell.status !== 'available' || cell.past || cell.status === 'noprice';
      var s = off ? 'off' : '';
      if (this.currentTime === cell.time && this.currentCourtName) s += ' sel';
      return s;
    },
    goCoach: function goCoach() {
      uni.navigateTo({
        url: '/pages/coach/coach'
      });
    },
    ensureBookableVenue: function ensureBookableVenue() {
      var that = this;
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getVenues'
        },
        success: function success(res) {
          var list = (res.result || {}).list || [];
          that.venueList = list;
          var id = that.venueId || uni.getStorageSync('venue_id') || '';
          var found = list.find(function (v) {
            return (v.venueId || v._id) === id;
          });
          if (found) {
            that.loadCourts();
            return;
          }
          if (id) {
            that.venueId = '';
            that.venueName = '请先选择场馆';
            uni.showToast({
              title: '请选择可订场的门店',
              icon: 'none'
            });
            if (list.length) that.venueSheetVisible = true;
            return;
          }
          that.loadCourts();
        },
        fail: function fail() {
          that.loadCourts();
        }
      });
    },
    switchVenue: function switchVenue() {
      var that = this;
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getVenues'
        },
        success: function success(res) {
          that.venueList = (res.result || {}).list || [];
          that.venueSheetVisible = true;
        },
        fail: function fail() {
          uni.showToast({
            title: '门店加载失败',
            icon: 'none'
          });
        }
      });
    },
    chooseVenue: function chooseVenue(v) {
      var id = v.venueId || v._id || '';
      var name = v.name || '';
      uni.setStorageSync('venue_id', id);
      uni.setStorageSync('venue_name', name);
      uni.setStorageSync('home_venue_id', id);
      uni.setStorageSync('home_venue_name', name);
      this.venueId = id;
      this.venueName = name;
      this.currentCourtName = '';
      this.currentTime = '';
      this.venueSheetVisible = false;
      this.loadCourts();
      if (this.currentDate) this.loadCourtStatus(this.currentDate);
    },
    pickCourt: function pickCourt(item) {
      this.currentCourtId = item.id;
      this.currentCourtName = item.name;
      this.currentTime = '';
    },
    cardMeta: function cardMeta(c) {
      var typeMap = {
        times: '次卡',
        coach: '教练卡',
        time: '时间卡',
        group: '团课卡'
      };
      var t = typeMap[c.type] || c.type;
      if (c.type === 'times' || c.type === 'coach') return t + ' · 剩' + (c.remainingTimes || 0) + '次';
      return t;
    },
    parseCardTimeRule: function parseCardTimeRule(card) {
      var rule = card && (card.timeRule || card.time_rule);
      if (!rule) return null;
      if ((0, _typeof2.default)(rule) === 'object') return rule;
      try {
        return JSON.parse(rule);
      } catch (e) {
        return null;
      }
    },
    inferCourtTypesFromName: function inferCourtTypesFromName(name, cardType) {
      var typ = String(cardType || '');
      var n = String(name || '');
      if (typ === 'stored' || typ === '储值' || typ === 'wallet' || n.indexOf('储值') >= 0) return [];
      if (n.indexOf('匹克') >= 0 || n.indexOf('丁克') >= 0) return ['匹克球'];
      if (n.indexOf('发球机') >= 0) return ['发球机'];
      return ['网球'];
    },
    resolveCardCourtTypes: function resolveCardCourtTypes(card) {
      var name = card && (card.cardName || card.card_name || card.name) || '';
      var typ = card && card.type || '';
      var rule = this.parseCardTimeRule(card);
      if (rule && Array.isArray(rule.courtTypes)) {
        var out = [];
        for (var i = 0; i < rule.courtTypes.length; i++) {
          var t = String(rule.courtTypes[i] || '').trim();
          if (t === '不限' || t === '*' || t === 'all') return [];
          if ((t === '网球' || t === '匹克球' || t === '发球机') && out.indexOf(t) < 0) out.push(t);
        }
        return out;
      }
      return this.inferCourtTypesFromName(name, typ);
    },
    inferCourtTypeFromCourt: function inferCourtTypeFromCourt(court) {
      var typ = String(court && court.type || '').trim();
      var name = String(court && (court.name || court.court) || '');
      if (typ === '网球' || typ === '匹克球' || typ === '发球机' || typ === '共用') return typ;
      if (name.indexOf('匹克') >= 0 || name.indexOf('丁克') >= 0) return '匹克球';
      if (!typ && name && (name.indexOf('发球机') === 0 || name.indexOf('发球机') >= 0)) return '发球机';
      return '网球';
    },
    isPureTennisCourt: function isPureTennisCourt(court) {
      if (!court || (0, _typeof2.default)(court) !== 'object') return false;
      var v = court.pureTennis != null ? court.pureTennis : court.pure_tennis;
      return v === true || v === 1 || v === '1';
    },
    isMachineOnlyCard: function isMachineOnlyCard(card) {
      var typ = String(card && card.type || '');
      if (typ === 'coach') return false;
      var allowed = this.resolveCardCourtTypes(card);
      if (!allowed.length) return false;
      return allowed.length === 1 && allowed[0] === '发球机';
    },
    hasMachineOnlyCards: function hasMachineOnlyCards() {
      var list = this.myCards || [];
      for (var i = 0; i < list.length; i++) {
        if (this.isMachineOnlyCard(list[i])) return true;
      }
      return false;
    },
    lookupCurrentCourt: function lookupCurrentCourt() {
      var court = this.activeCourt || {
        name: this.currentCourtName,
        type: ''
      };
      var lists = [this.courtConfig || [], this.courtList || []];
      if ((!court || !court.name || court.pureTennis == null && court.pure_tennis == null || !court.type) && this.currentCourtName) {
        for (var a = 0; a < lists.length; a++) {
          var list = lists[a];
          for (var i = 0; i < list.length; i++) {
            if (list[i].name === this.currentCourtName) {
              court = Object.assign({}, court || {}, list[i]);
              break;
            }
          }
        }
        if (!court || !court.name) court = {
          name: this.currentCourtName,
          type: ''
        };
      }
      return court;
    },
    cardAllowsCurrentCourt: function cardAllowsCurrentCourt(card) {
      var court = this.lookupCurrentCourt();
      if (this.isPureTennisCourt(court) && this.isMachineOnlyCard(card)) return false;
      var allowed = this.resolveCardCourtTypes(card);
      if (!allowed.length) return true;
      if (!court || !court.name) return true;
      var courtType = this.inferCourtTypeFromCourt(court);
      var required;
      if (courtType === '共用') {
        required = this.sport === 'pickleball' ? ['匹克球'] : ['网球', '发球机'];
      } else if (courtType === '发球机' || courtType === '网球') {
        required = ['网球', '发球机'];
      } else {
        required = [courtType];
      }
      for (var j = 0; j < required.length; j++) {
        if (allowed.indexOf(required[j]) >= 0) return true;
      }
      return false;
    },
    isCardUsable: function isCardUsable(card, dateStr, timeStr) {
      if (!card || card.status !== 'active') return false;
      if (card.type === 'group' || card.type === 'coach' || card.type === 'stored' || card.type === '储值') return false;
      if (card.validFrom && dateStr < card.validFrom) return false;
      if (card.validTo && dateStr > card.validTo) return false;
      if (!this.cardAllowsCurrentCourt(card)) return false;
      if (card.type === 'times') return (card.remainingTimes || 0) > 0;
      if (card.type === 'time') {
        var rule = this.parseCardTimeRule(card) || card.timeRule;
        if (!rule || rule.mode === 'unlimited' || rule.mode === 'all') return true;
        if (rule.mode === 'dates') {
          var ranges = rule.dateRanges || [];
          for (var d = 0; d < ranges.length; d++) {
            var rg = ranges[d] || {};
            if (rg.start && rg.end && dateStr >= rg.start && dateStr <= rg.end) return true;
          }
          return false;
        }
        var dt = new Date(String(dateStr).replace(/-/g, '/'));
        var weekday = dt.getDay();
        if (weekday === 0) weekday = 7;
        var slotStart = (timeStr || '').split('-')[0];
        if (rule.mode === 'rules' && Array.isArray(rule.rules)) {
          for (var i = 0; i < rule.rules.length; i++) {
            var r = rule.rules[i];
            var days = (r.weekdays || []).map(function (n) {
              return Number(n);
            });
            if (days.indexOf(weekday) < 0) continue;
            if (r.unlimited) return true;
            var slots = r.timeSlots || [];
            for (var j = 0; j < slots.length; j++) {
              var s = slots[j];
              if (slotStart >= s.start && slotStart < s.end) return true;
            }
          }
          return false;
        }
      }
      return true;
    },
    loadCourts: function loadCourts() {
      var that = this;
      that.venueName = uni.getStorageSync('venue_name') || '';
      var venueId = uni.getStorageSync('venue_id');
      if (!venueId) {
        that.courtConfig = [];
        that.courtList = [];
        return;
      }
      that.courtConfig = [];
      that.courtList = [];
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getCourts',
          venueId: venueId
        },
        success: function success(res) {
          var result = res.result || {};
          if (!result.ok) return;
          that.courtConfig = (result.list || []).map(function (item) {
            return {
              id: item._id,
              name: item.name,
              desc: item.type || '',
              type: item.type || '',
              remark: item.remark || '',
              pureTennis: item.pureTennis === 1 || item.pureTennis === true || item.pure_tennis === 1 || item.pure_tennis === '1' ? 1 : 0
            };
          });
          that.hasPickleball = that.courtConfig.some(function (c) {
            var s = that.courtSport(c);
            return s === 'pickleball' || s === 'both';
          });
          if (!that.hasPickleball && that.sport === 'pickleball') that.sport = 'tennis';
          if (that.courtConfig.length && !that.currentCourtName) {
            that.currentCourtId = that.courtConfig[0].id;
            that.currentCourtName = that.courtConfig[0].name;
          }
          if (that.currentDate) that.loadCourtStatus(that.currentDate);
        }
      });
    },
    initDateList: function initDateList() {
      var weeks = ['日', '一', '二', '三', '四', '五', '六'];
      var list = [];
      var today = new Date();
      for (var i = 0; i < 7; i++) {
        var d = new Date(today.getTime());
        d.setDate(today.getDate() + i);
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        var day = d.getDate();
        var mm = m < 10 ? '0' + m : '' + m;
        var dd = day < 10 ? '0' + day : '' + day;
        list.push({
          date: y + '-' + mm + '-' + dd,
          week: i === 0 ? '今天' : '周' + weeks[d.getDay()],
          md: m + '.' + dd
        });
      }
      this.dateList = list;
      this.currentDate = list[0].date;
      this.loadCourtStatus(list[0].date);
    },
    setSport: function setSport(sport) {
      this.sport = sport;
      this.currentCourtName = '';
      this.currentTime = '';
      if (this.currentDate) this.loadCourtStatus(this.currentDate);
    },
    courtSport: function courtSport(court) {
      var typ = String(court && court.type || '').trim();
      var name = String(court && (court.name || court.court) || '');
      var remark = String(court && court.remark || '');
      if (typ === '共用') return 'both';
      if (typ === '匹克球') return 'pickleball';
      if (typ === '网球' || typ === '发球机') return 'tennis';
      var text = typ + name + remark;
      var hasShare = text.indexOf('共用') >= 0;
      var hasPickle = text.indexOf('匹克') >= 0 || text.indexOf('丁克') >= 0;
      var hasTennisish = text.indexOf('网球') >= 0 || text.indexOf('发球机') >= 0;
      if (hasShare || hasPickle && hasTennisish) return 'both';
      if (hasPickle) return 'pickleball';
      return 'tennis';
    },
    onSelectDate: function onSelectDate(date) {
      this.currentDate = date;
      this.currentTime = '';
      this.loadCourtStatus(date);
    },
    getAvailableTimes: function getAvailableTimes(dateStr) {
      var now = new Date();
      var y = now.getFullYear();
      var m = now.getMonth() + 1;
      var day = now.getDate();
      var mm = m < 10 ? '0' + m : '' + m;
      var dd = day < 10 ? '0' + day : '' + day;
      var todayStr = y + '-' + mm + '-' + dd;
      if (dateStr !== todayStr) return this.allTimes;
      var currentHour = now.getHours();
      var currentMinute = now.getMinutes();
      return this.allTimes.filter(function (item) {
        if (item.hour < currentHour) return false;
        if (item.hour === currentHour && currentMinute > 0) return false;
        return true;
      });
    },
    loadCourtStatus: function loadCourtStatus(date) {
      var that = this;
      var venueId = uni.getStorageSync('venue_id') || '';
      var courtConfig = that.courtConfig;
      if (!venueId || !courtConfig.length) {
        that.courtList = [];
        return;
      }
      var d = new Date(String(date).replace(/-/g, '/'));
      var weekday = d.getDay();
      if (weekday === 0) weekday = 7;
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getVenueHours',
          venueId: venueId,
          weekday: weekday
        }
      }).then(function (hr) {
        var result = hr && hr.result || {};
        var slots = result.byWeekday && result.byWeekday[weekday] || result.slots || [];
        var availableTimes = (slots.length ? slots : that.allTimes.map(function (x) {
          return x.time;
        })).map(function (time) {
          var hour = Number(String(time).slice(0, 2));
          return {
            time: time,
            short: String(time).slice(0, 5),
            hour: hour
          };
        });
        var now = new Date();
        var mm = now.getMonth() + 1;
        var dd = now.getDate();
        var today = now.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
        var pastMap = {};
        if (date === today) {
          availableTimes.forEach(function (item) {
            var started = item.hour < now.getHours() || item.hour === now.getHours() && now.getMinutes() > 0;
            if (started) pastMap[item.time] = true;
          });
        }
        that._openTimes = availableTimes;
        that._pastMap = pastMap;
        return wx.cloud.callFunction({
          name: 'userApi',
          data: {
            action: 'getCourtPrices',
            venueId: venueId,
            weekday: weekday
          }
        });
      }).then(function (pr) {
        var r = (pr.result || {}).list || [];
        var map = {};
        r.forEach(function (row) {
          if (row.court && row.timeSlot) map[row.court + '_' + row.timeSlot] = Number(row.price) || 0;
        });
        that.priceMap = map;
        return wx.cloud.callFunction({
          name: 'userApi',
          data: {
            action: 'getSchedule',
            venueId: venueId,
            date: date
          }
        });
      }).then(function (res) {
        var result = res.result || {};
        var bookedMap = {};
        var groupMap = {};
        var sportMap = {};
        (result.bookings || []).forEach(function (item) {
          if ((item.status === 'booked' || item.status === 'locked' || item.status === 'pending_pay') && !item.groupClassId) {
            var bkey = that.slotKey(item.court, item.time);
            bookedMap[bkey] = true;
            if (String(item.remark || '').indexOf('匹克') >= 0) sportMap[bkey] = '匹克球';
          }
        });
        (result.groupClasses || []).forEach(function (g) {
          if (g.status === 'open') groupMap[that.slotKey(g.court, g.time)] = true;
        });
        var availableTimes = (that._openTimes || []).filter(function (t) {
          return !(that._pastMap && that._pastMap[t.time]);
        });
        if (that.currentTime && that._pastMap && that._pastMap[that.currentTime]) {
          that.currentTime = '';
          that.currentCourtId = '';
          that.currentCourtName = '';
        }
        var courts = courtConfig.filter(function (court) {
          var s = that.courtSport(court);
          return s === 'both' || s === that.sport;
        });
        that.courtList = courts.map(function (court) {
          return {
            id: court.id,
            name: court.name,
            desc: court.desc,
            type: court.type || court.desc,
            remark: court.remark || '',
            times: availableTimes.map(function (t) {
              var key = that.slotKey(court.name, t.time);
              var status = 'available';
              var past = !!(that._pastMap && that._pastMap[t.time]);
              if (groupMap[key]) status = 'group';else if (bookedMap[key]) status = 'full';
              var price = that.lookupPrice(court.name, t.time);
              if (status === 'available' && !price) status = 'noprice';
              return {
                time: t.time,
                short: t.short,
                status: status,
                past: past,
                price: price,
                sportText: sportMap[key] || ''
              };
            })
          };
        });
        if (that.courtList.length && !that.currentCourtName) {
          that.currentCourtId = that.courtList[0].id;
          that.currentCourtName = that.courtList[0].name;
        }
      }).catch(function (err) {
        console.error('loadCourtStatus', err);
      });
    },
    onSelectSlot: function onSelectSlot(courtId, courtName, time, status, past) {
      if (past) {
        uni.showToast({
          title: '该时段已过，不能预约',
          icon: 'none'
        });
        return;
      }
      if (status === 'full') {
        uni.showToast({
          title: '该时段已被预约',
          icon: 'none'
        });
        return;
      }
      if (status === 'group') {
        uni.showToast({
          title: '该时段为团课，请从团课入口报名',
          icon: 'none'
        });
        return;
      }
      if (status === 'noprice') {
        uni.showToast({
          title: '该时段暂未标价，无法预约',
          icon: 'none'
        });
        return;
      }
      this.currentCourtId = courtId;
      this.currentCourtName = courtName;
      this.currentTime = time;
    },
    loadNotice: function loadNotice() {
      var that = this;
      var venueId = uni.getStorageSync('venue_id') || '';
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getNotice',
          venueId: venueId
        }
      }).then(function (res) {
        var r = res.result || {};
        that.notice = r.notice || null;
        if (that.notice && that.notice.content) {
          that.noticeVisible = true;
        } else {
          that.openCardSheet();
        }
      }).catch(function () {
        that.notice = null;
        that.openCardSheet();
      });
    },
    onBook: function onBook() {
      var nickName = uni.getStorageSync('nickName') || '';
      var phone = uni.getStorageSync('phone') || '';
      if (!nickName || !phone) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        uni.navigateTo({
          url: '/pages/login/login'
        });
        return;
      }
      if (!this.currentDate || !this.currentCourtName || !this.currentTime) {
        uni.showToast({
          title: '请选择场地和时间',
          icon: 'none'
        });
        return;
      }
      this.loadNotice();
    },
    confirmNotice: function confirmNotice() {
      this.noticeVisible = false;
      this.openCardSheet();
    },
    openCardSheet: function openCardSheet() {
      this.selectedCardId = '';
      this.walletBalance = Number(uni.getStorageSync('balance') || 0);
      this.payWay = this.currentPrice > 0 && this.walletBalance + 0.001 >= this.currentPrice ? 'balance' : this.currentPrice > 0 ? 'wx' : 'card';
      this.cardSheetVisible = true;
      this.loadMyCards();
      this.loadWallet();
    },
    loadWallet: function loadWallet() {
      var that = this;
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getWallet',
          userId: uni.getStorageSync('userDocId') || '',
          phone: uni.getStorageSync('phone') || ''
        },
        success: function success(res) {
          var r = res.result || {};
          if (!r.ok) return;
          that.walletBalance = Number(r.balance) || 0;
          uni.setStorageSync('balance', that.walletBalance);
          if (that.cardSheetVisible && that.currentPrice > 0 && that.payWay !== 'card' && that.payWay !== 'wx') {
            if (that.walletBalance + 0.001 >= that.currentPrice) that.payWay = 'balance';
          }
        }
      });
    },
    loadMyCards: function loadMyCards() {
      var that = this;
      that.cardLoading = true;
      wx.cloud.callFunction({
        name: 'userApi',
        data: {
          action: 'getMyCards',
          userId: uni.getStorageSync('userDocId') || '',
          phone: uni.getStorageSync('phone') || ''
        },
        success: function success(res) {
          that.myCards = (res.result || {}).list || [];
        },
        fail: function fail() {
          that.myCards = [];
        },
        complete: function complete() {
          that.cardLoading = false;
        }
      });
    },
    pickWxPay: function pickWxPay() {
      this.payWay = 'wx';
      this.selectedCardId = '';
    },
    pickBalancePay: function pickBalancePay() {
      if (this.walletBalance + 0.001 < this.currentPrice) {
        uni.showToast({
          title: '现金余额不足',
          icon: 'none'
        });
        return;
      }
      this.payWay = 'balance';
      this.selectedCardId = '';
    },
    pickCardPay: function pickCardPay(id) {
      this.payWay = 'card';
      this.selectedCardId = id;
    },
    submitBook: function submitBook() {
      var that = this;
      var nickName = uni.getStorageSync('nickName') || '';
      var phone = uni.getStorageSync('phone') || '';
      var userDocId = uni.getStorageSync('userDocId') || '';
      var openid = uni.getStorageSync('openid') || '';
      var sel = null;
      if (that.payWay === 'card' && that.selectedCardId) {
        sel = (that.myCards || []).find(function (c) {
          return c._id === that.selectedCardId;
        });
        if (!sel) {
          uni.showToast({
            title: '请重新选择会员卡',
            icon: 'none'
          });
          return;
        }
      }
      if (that.payWay === 'card' && !sel && !(that.currentPrice > 0)) {
        uni.showToast({
          title: '该时段暂未标价，请选择会员卡或更换时段',
          icon: 'none'
        });
        return;
      }
      that.booking = true;
      function doCreate(payNo) {
        wx.cloud.callFunction({
          name: 'userApi',
          data: {
            action: 'createBooking',
            data: {
              court: that.currentCourtName,
              date: that.currentDate,
              time: that.currentTime,
              venueId: uni.getStorageSync('venue_id') || '',
              venueName: uni.getStorageSync('venue_name') || '',
              userName: nickName,
              phone: phone,
              userId: userDocId,
              cardId: sel ? sel._id : '',
              cardName: sel ? sel.cardName : '',
              cardType: sel ? sel.type : '',
              payOrderNo: payNo || '',
              outTradeNo: payNo || '',
              sport: that.sport,
              remark: that.sport === 'pickleball' ? '匹克球' : ''
            }
          }
        }).then(function (r) {
          var result = r.result || {};
          if (!result.ok) {
            uni.showToast({
              title: result.msg || '预约失败',
              icon: 'none'
            });
            return;
          }
          uni.showToast({
            title: '预约成功',
            icon: 'success'
          });
          that.cardSheetVisible = false;
          that.currentTime = '';
          that.loadCourtStatus(that.currentDate);
        }).catch(function () {
          uni.showToast({
            title: '预约失败',
            icon: 'none'
          });
        }).finally(function () {
          that.booking = false;
        });
      }
      if (that.payWay === 'balance') {
        if (!(that.currentPrice > 0)) {
          uni.showToast({
            title: '该时段暂未标价，无法用余额支付',
            icon: 'none'
          });
          that.booking = false;
          return;
        }
        if (that.walletBalance + 0.001 < that.currentPrice) {
          uni.showToast({
            title: '现金余额不足（当前 ¥' + Number(that.walletBalance).toFixed(2) + '）',
            icon: 'none'
          });
          that.booking = false;
          return;
        }
        wx.cloud.callFunction({
          name: 'userApi',
          data: {
            action: 'createBooking',
            data: {
              court: that.currentCourtName,
              date: that.currentDate,
              time: that.currentTime,
              venueId: uni.getStorageSync('venue_id') || '',
              venueName: uni.getStorageSync('venue_name') || '',
              userName: nickName,
              phone: phone,
              userId: userDocId,
              payWay: 'balance',
              sport: that.sport,
              remark: that.sport === 'pickleball' ? '匹克球' : ''
            }
          }
        }).then(function (r) {
          var result = r.result || {};
          if (!result.ok) {
            uni.showToast({
              title: result.msg || '预约失败',
              icon: 'none'
            });
            return;
          }
          var left = that.walletBalance - that.currentPrice;
          if (left < 0) left = 0;
          that.walletBalance = Math.round(left * 100) / 100;
          uni.setStorageSync('balance', that.walletBalance);
          uni.showToast({
            title: '预约成功',
            icon: 'success'
          });
          that.cardSheetVisible = false;
          that.currentTime = '';
          that.loadCourtStatus(that.currentDate);
        }).catch(function () {
          uni.showToast({
            title: '预约失败',
            icon: 'none'
          });
        }).finally(function () {
          that.booking = false;
        });
        return;
      }
      if (that.payWay !== 'card') {
        that.payWay = 'wx';
        if (!(that.currentPrice > 0)) {
          uni.showToast({
            title: '请选择会员卡',
            icon: 'none'
          });
          that.booking = false;
          return;
        }
        if (!openid) {
          uni.showToast({
            title: '登录信息不完整，请重新登录',
            icon: 'none'
          });
          that.booking = false;
          return;
        }
        wx.cloud.callFunction({
          name: 'pay',
          data: {
            action: 'createCourtPay',
            venueId: uni.getStorageSync('venue_id') || '',
            venueName: uni.getStorageSync('venue_name') || '',
            court: that.currentCourtName,
            date: that.currentDate,
            time: that.currentTime,
            amount: that.currentPrice,
            openid: openid,
            userId: userDocId,
            userName: nickName,
            phone: phone,
            sport: that.sport
          }
        }).then(function (r) {
          var result = r.result || {};
          if (!result.ok || !result.payParams) {
            uni.showToast({
              title: result.msg || '下单失败',
              icon: 'none'
            });
            that.booking = false;
            return;
          }
          var p = result.payParams;
          var tradeNo = result.outTradeNo || '';
          uni.requestPayment({
            timeStamp: p.timeStamp,
            nonceStr: p.nonceStr,
            package: p.package,
            signType: p.signType,
            paySign: p.paySign,
            success: function success() {
              // 订场只在 payNotify/confirmCourtPay 落 booked，不再单独 createBooking
              function pollConfirm(left) {
                wx.cloud.callFunction({
                  name: 'pay',
                  data: {
                    action: 'confirmCourtPay',
                    outTradeNo: tradeNo
                  }
                }).then(function (cr) {
                  var c = cr && cr.result || {};
                  if (c.ok) {
                    uni.showToast({
                      title: '预约成功',
                      icon: 'success'
                    });
                    that.cardSheetVisible = false;
                    that.currentTime = '';
                    that.loadCourtStatus(that.currentDate);
                    that.booking = false;
                    return;
                  }
                  if (c.waiting && left > 0) {
                    setTimeout(function () {
                      pollConfirm(left - 1);
                    }, 1000);
                    return;
                  }
                  uni.showToast({
                    title: '支付成功，预约确认中',
                    icon: 'none'
                  });
                  that.cardSheetVisible = false;
                  that.currentTime = '';
                  that.loadCourtStatus(that.currentDate);
                  that.booking = false;
                }).catch(function () {
                  if (left > 0) {
                    setTimeout(function () {
                      pollConfirm(left - 1);
                    }, 1000);
                  } else {
                    uni.showToast({
                      title: '支付成功，请稍后在我的预约查看',
                      icon: 'none'
                    });
                    that.cardSheetVisible = false;
                    that.loadCourtStatus(that.currentDate);
                    that.booking = false;
                  }
                });
              }
              pollConfirm(8);
            },
            fail: function fail() {
              if (tradeNo) {
                wx.cloud.callFunction({
                  name: 'pay',
                  data: {
                    action: 'cancelCourtPay',
                    outTradeNo: tradeNo
                  }
                });
              }
              uni.showToast({
                title: '已取消支付',
                icon: 'none'
              });
              that.booking = false;
              that.loadCourtStatus(that.currentDate);
            }
          });
        }).catch(function () {
          uni.showToast({
            title: '下单失败',
            icon: 'none'
          });
          that.booking = false;
        });
        return;
      }
      doCreate('');
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 92:
/*!******************************************************************************************!*\
  !*** D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue?vue&type=style&index=0&lang=css& ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./booking.vue?vue&type=style&index=0&lang=css& */ 93);
/* harmony import */ var _HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_booking_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 93:
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/山羊goat项目/网球场馆小程序_uni/pages/booking/booking.vue?vue&type=style&index=0&lang=css& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[86,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/booking/booking.js.map