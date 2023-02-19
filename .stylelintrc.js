module.exports = {
  processors: [],
  plugins: ['stylelint-order', 'stylelint-scss'],
  extends: [
    'stylelint-config-standard', 
    "stylelint-config-standard-scss",
    'stylelint-config-recess-order',  
    "stylelint-config-html", 
    "stylelint-config-recommended-vue"
  ], // 这是官方推荐的方式
  rules: {
    // at-rule-no-unknown: 屏蔽一些scss等语法检查
    "shorthand-property-no-redundant-values": null,
    "scss/double-slash-comment-empty-line-before": null,
    "scss/dollar-variable-pattern": null,
    "scss/at-import-partial-extension": null,
    "alpha-value-notation":null,
    "color-function-notation": null,
    "selector-class-pattern": null,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-redundant-nesting-selector': true,
    'font-family-no-missing-generic-family-keyword': null,
    'no-descending-specificity': null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": [
          "/.*deep/"
        ]
      }
    ],
    "indentation": [
      2, 
    ]
  },
  overrides: [
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss"
    },
  ],
  
}