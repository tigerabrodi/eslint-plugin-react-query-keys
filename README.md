# eslint-plugin-react-sage-mode

ESLint plugin with rules to help avoid common React performance pitfalls.

Named "Sage Mode" because I'm a big naruto fan lol

# How I recommend using this plugin (if you wanna use it)

Use it like Knip. Turn it on time to time to check for performance issues.

## Installation

```bash
npm install eslint-plugin-react-sage-mode --save-dev
# or
yarn add eslint-plugin-react-sage-mode --dev
# or
pnpm add eslint-plugin-react-sage-mode --save-dev
```

## Usage

Add to your ESLint configuration:

```js
// .eslintrc.js
module.exports = {
  plugins: ["react-sage-mode"],
  rules: {
    "react-sage-mode/no-inline-object": "warn",
    "react-sage-mode/no-inline-function": "warn",
    "react-sage-mode/no-unmemoized-callback": "warn",
  },
};
```

## Available Rules

This plugin provides 3 rules to help avoid React performance issues:

### no-inline-object

Prevents inline object creation in JSX props for custom components, which causes unnecessary re-renders due to new object references on each render.

```jsx
// ❌ Bad (new object reference each render)
<Button style={{ margin: "1rem" }} />;

// ✅ Good (stable object reference)
const buttonStyle = { margin: "1rem" };
<Button style={buttonStyle} />;
```

### no-inline-function

Prevents inline function creation in JSX props for custom components, which creates new function references on each render.

```jsx
// ❌ Bad (new function reference each render)
<Button onClick={() => handleClick()} />;

// ✅ Good (stable function reference with useCallback)
const handleButtonClick = useCallback(() => handleClick(), []);
<Button onClick={handleButtonClick} />;
```

### no-unmemoized-callback

Detects when functions defined within components are passed to custom components' props without being wrapped in useCallback.

```jsx
// ❌ Bad (function reference changes each render)
function Component() {
  function handleClick() { ... }
  return <Button onClick={handleClick} />;
}

// ✅ Good (stable function reference with useCallback)
function Component() {
  const handleClick = useCallback(() => { ... }, []);
  return <Button onClick={handleClick} />;
}
```

## Note

This is a toy project created to learn about ESLint plugin development. Feel free to use it in your projects, but be aware it might not catch all edge cases.

You're better off using [Million Lint](https://million.dev/docs).

## License

MIT
