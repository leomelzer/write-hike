---
title: Enforcing Coding Conventions
description: ""
pubDate: 2024-11-05
heroImage: "./enforcing-coding-conventions/mark-duffel-U5y077qrMdI-unsplash.jpg"
---

Conventions are good. They help keep a project consistent and allow the team to move fast. Discussions about individual coding preferences become moot, at least if the debated topic has been discussed together and the consensus was then added to the conventions.

Conventions as text (like the `CONVENTIONS.md` file many projects have) are good. I personally like something **more futureproof** though. By integrating the conventions on the tooling level, you can ensure future iterations of the code base will still adhere to them.

Do you remember the days before [prettier](https://archive.jlongster.com/A-Prettier-Formatter)? I'm happy to never having to think about formatting my code again. This solves _how it looks_. But not _what it does_. We need to reach for different tools here.

Maybe you've heard of the _Testing Pyramid_ or [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications). Enforcing conventions should be done at the lowest level, the **static** tests. This is also were both of the following strategies can be categorized.

## Enforcing with TypeScript

In one recent project we had the requirement to add the HTML `id` attribute to _every_ interactive element, like `<a>` or `<button>`. The business reason was to provide hooks for the analytics team. However, the web-app we built was highly dynamic, generated from data from a headless CMS at request time. The project also used the excellent [Chakra UI library](https://www.chakra-ui.com/) which ships with extensive types. As you can imagine, the `id` attribute was marked optional for the components in question.

Our solution: Using [TypeScript module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) we required the `id` attribute to be set explicitly.

```ts
// @file ./types/@chakra-ui/react.d.ts
import "@chakra-ui/react";

/**
 * Convention: We require setting the `id` attribute for interactive elements.
 * Discussion: https://github.com/peerigon/my-project/issues/123
 */
declare module "@chakra-ui/react" {
  export interface ButtonProps {
    /**
     * Please use an English slug as identifier.
     */
    id: string;
  }
  export interface LinkProps {
    /**
     * Please use an English slug as identifier.
     */
    id: string;
  }
}
```

Note the absence of the `?` operator which would mark the attribute as optional. Running the TypeScript compiler now would throw errors if the `id` attribute was ever unset -- across the entire code base. This immediately highlighted where we were missing the attribute. We created a custom property for each related model in the headless CMS to enable the customer to create and pass through the value. We made sure to mark this custom property as _required_ which gets reflected in the GraphQL schema.

This solution works great and ensures that each future use of these interactive elements will have a defined `id` attribute.

## Enforcing with ESLint

It's very likely the web app you are working on right now has ESLint installed and configured. One rule we have used in most recent projects is called [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports). As the name suggests, it allows you to restrict the sources from which you import. This in turn can be used to enforce a convention:

```js
// @file eslint.config.js
export default [
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              // See https://codedrivendevelopment.com/posts/lodash-tree-shaking
              name: "lodash",
              message:
                "Please use direct imports like 'lodash/merge' instead because of better bundle size.",
            },
            {
              name: "@chakra-ui/react",
              importNames: [
                "FormLabel",
                "FormControl",
                "Textarea",
                "useToast",
                "Modal",
              ],
              message:
                "We compose this component/hook in our code, please use that instead.",
            },
          ],
        },
      ],
    },
  },
];
```

Here you can see two use cases:

1. We restrict importing from the `lodash` package directly. Instead, importing the required submodule is enforced:

```ts
// ❌ Error
import lodash from "lodash";
lodash.uniqueId();

// ✅ Pass
import uniqueId from "lodash/uniqueId";
uniqueId();
```

2. We restrict the given list of named imports from the `@chakra-ui/react` package. We actually customized these in our project and prefer to use them instead. We can make this developer friendly and helpful by providing an appropriate message.

ESLint gives you an even more powerful tool: writing your own rules. It's actually not very difficult and there is a [generator to get you started](https://github.com/eslint/generator-eslint).

In fact, we created a plugin for one of our customer projects to validate the style of variable names. Works like a charm!

The exact tool and rule you should use . I hope these strategies help you and your team to _stay on the path_ and move fast.

---

<div class="center">

Header Photo by <a href="https://unsplash.com/@2mduffel?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Mark Duffel</a> on <a href="https://unsplash.com/photos/please-stay-on-the-path-signage-U5y077qrMdI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

</div>
