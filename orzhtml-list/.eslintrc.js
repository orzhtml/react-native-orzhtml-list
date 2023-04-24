module.exports = {
    root: true,
    extends: [
        'standard',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['import', '@typescript-eslint'],
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.js'],
            rules: {
                '@typescript-eslint/no-shadow': 0, // 外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
                'no-shadow': 0, // 外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
                'no-undef': 1, // 不能有未定义的变量
                'no-unused-vars': 0, // 不能有声明后未被使用的变量或参数
                'no-console': 0, // 不禁用 console
                indent: [1, 2, { SwitchCase: 1 }],
                eqeqeq: 2, // 必须使用全等
                'prefer-const': 0,
                'handle-callback-err': 0,
                'no-return-assign': 0,
                'no-mixed-spaces-and-tabs': 0,
                'no-delete-var': 2, // 不能对var声明的变量使用 delete 操作符
                'no-const-assign': 2, // 禁止修改 const 声明的变量
                'array-callback-return': 0, // 避免多次调用回调什么的
                // note you must disable the base rule as it can report incorrect errors
                'no-use-before-define': 0,
                // 'no-use-before-define': ['error', { enums: false }],
                // '@typescript-eslint/no-use-before-define': ['error'],
                'spaced-comment': 'warn', // 注释要含有空格
                camelcase: 'warn', // 驼峰命名
                'multiline-ternary': ['error', 'never'],
                'react-hooks/exhaustive-deps': 0,
                'comma-dangle': ['error', 'always-multiline'], // 对象字面量项尾不能有逗号
                'generator-star-spacing': 0, // 生成器函数*的前后空格
                'object-curly-spacing': [2, 'always'], // 大括号内是否允许不必要的空格
                // 'node/no-deprecated-api': 0,
                'react/no-deprecated': 0,
                'react/display-name': ['off', { ignoreTranspilerName: true }],
                'react/no-string-refs': 0,
                'react/no-did-mount-set-state': 0, // 防止在 componentDidMount 中使用 setState
                'react/no-did-update-set-state': 1, // 防止在 componentDidUpdate 中使用 setState
                'react/no-direct-mutation-state': 2, // 防止this.state的直接变异
                'react/no-set-state': 0, // 防止使用 setState
                // warn
                'import/first': 'warn', // import 放在文件头
                'quote-props': 0,
                // 'no-multi-spaces': 0,
            },
        },
    ],
    globals: {
        __DEV__: true,
        NodeJS: true,
        XMLHttpRequest: true,
        FormData: true,
    },
}
