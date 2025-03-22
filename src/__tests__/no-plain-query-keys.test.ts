import { RuleTester } from "@typescript-eslint/rule-tester";
import { noInlineFunction } from "../rules/no-inline-function";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("no-inline-function", noInlineFunction, {
  valid: [
    {
      code: "const handleClick = () => {};", // Regular function declaration is fine
    },
    {
      code: `
        const handleSubmit = () => console.log('submit');
        function Component() {
          return <Button onClick={handleSubmit} />;
        }
      `, // Using function reference with component is good
    },
    {
      code: `
        function Component() {
          return <button onClick={() => alert('clicked')} />;
        }
      `, // Inline function on HTML element is allowed
    },
    {
      code: `
        function Component() {
          const handleChange = useCallback(() => {}, []);
          return <Input onChange={handleChange} />;
        }
      `, // Using useCallback is good
    },
    {
      code: `
        function Component() {
          return <div onMouseOver={function() { console.log('hover') }} />;
        }
      `, // Function expression on HTML element is allowed
    },
    {
      code: `
        function Component() {
          return <form onSubmit={(e) => e.preventDefault()} />;
        }
      `, // HTML elements with inline functions are fine
    },
  ],
  invalid: [
    {
      code: `
        function Component() {
          return <Button onClick={() => console.log('clicked')} />;
        }
      `,
      errors: [{ messageId: "noInlineFunction" }],
    },
    {
      code: `
        function Component() {
          return <CustomInput onChange={(e) => setValue(e.target.value)} />;
        }
      `,
      errors: [{ messageId: "noInlineFunction" }],
    },
    {
      code: `
        const Component = () => (
          <Modal onClose={function() { 
            setOpen(false);
            resetForm();
          }} />
        );
      `,
      errors: [{ messageId: "noInlineFunction" }],
    },
    {
      code: `
        function Component() {
          return (
            <Form 
              onSubmit={() => handleSubmit()}
              onReset={() => resetForm()}
            />
          );
        }
      `,
      errors: [
        { messageId: "noInlineFunction" },
        { messageId: "noInlineFunction" },
      ],
    },
  ],
});
