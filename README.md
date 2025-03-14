# BONFIRE

- Turborepo
- React.js 19
- Next.js 15
- Tailwindcss v4
- Shadcn/ui

# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@repo/ui/components/button";
```

## shadcn/ui problocks

https://url9196.lemonsqueezy-mail.com/ls/click?upn=u001.5P5E5ZdLNcqQ8CduXpF-2BvoaKdB4Vv173aAn-2BUlr8bsDaHvogdpsyawsSEi1J1grUHh1pitOulEvqBKFLQKHVEoW9UYbbl6CTpPdBT2ZtoUZ1hCrnJra9vQJDc3-2B1kMwsqxFbvZ00vN7Qz6Z4wckwicDjNfwuGpegyKeKG4IGg7ms98PPuJr7RLfoCPByN7yGzesNjS7TE4SJcHdlEy3aI-2BRp8L6KsHomtl-2B5YuK5s2h36ZJRV3P9IpdT13LgjvxaUDhz_GEO6k8ojm-2FK-2BI-2BVoQ6fVrwuuzC0-2FYO9mDdmWw-2BHzbqcZ1cXF8i-2B6-2B3F0RlFcoGcNzpw0tI6qyqy-2BDnkkKnT8eZ-2B0gQDc5Q8P61HC9Ew2xOozMf18XjNldvYPwpSaY20P69E9eNhfmi80O8sKbBjABwj2Ac02hMqe0lmwVY-2FfW-2BpOC5GZ-2BkIgqjv-2FTa8UqTYzzc29nrmCy-2FsU3JFWDhEh9Q-3D-3D
