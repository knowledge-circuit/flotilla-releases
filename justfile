# Start the docs dev server with hot reload (just docs 5174 to pick another port)
docs port="5173":
    cd docs && DOCS_PORT={{port}} pnpm dev
