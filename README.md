# auto-prettier
> prettier with restricted rules

### Features

- Help you filter out ignorance in `.gitignore`
- Auto resolve your project directory

### Rules

```
semi: false
singleQuote: true
bracketSpacing: false
trailingComma: 'es5'
```

### Usage

```
npm i -S auto-prettier
```

package.json

```json
{
  "scripts": {
    "auto-prettier": "auto-prettier"  
  },
  "auto-prettier": {
    "files": [
      "src/**/*.js",
      "test/**/*.js"
    ]
  }
}
```
