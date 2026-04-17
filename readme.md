# Emerald SPA Framework

Emerald is a lightweight, declarative Single Page Application (SPA) framework designed for simplicity and ease of use. It allows you to build dynamic web applications using simple HTML attributes and standard JSON data.

## Features

- **Declarative Routing**: Define routes directly in your HTML.
- **Dynamic Templating**: Use `{{variable}}` syntax for data binding.
- **Automatic Data Fetching**: Bind elements to JSON data sources with a single attribute.
- **Data Querying**: Filter array data using SQL-like expressions or ID selectors.
- **Component-based Templates**: Load external HTML fragments for better code organization.
- **Lightweight**: No heavy dependencies, just a single JavaScript file.

## Getting Started

To use Emerald, include `emerald.js` in your HTML and initialize it.

```html
<script src="emerald/emerald.js"></script>
<script>
    window.onload = function() {
        Emerald.init();
    };
</script>
```

## Core Functionalities

### 1. Routing
Define routes using the `route` attribute. Emerald uses hash-based routing by default (`#!/`).

```html
<emerald route="home">
    <h1>Welcome Home</h1>
</emerald>

<emerald route="about">
    <h1>About Us</h1>
</emerald>
```

### 2. Data Binding
Use the `data` attribute to fetch JSON files (automatically appends `.json`).

```html
<!-- Fetches profiles.json -->
<emerald data="profiles">
    <div class="user">
        <strong>{{name}}</strong> ({{email}})
    </div>
</emerald>
```

### 3. Data Filtering
Filter data from an array using `select`/`selector` for IDs or `where` for complex queries.

#### ID Selection
```html
<emerald data="users" select="1" selector="id">
    <p>Viewing User: {{name}}</p>
</emerald>
```

#### SQL-like Queries
```html
<emerald data="users" where="age >= 18 AND status = 'active'">
    <li>{{name}}</li>
</emerald>
```

### 4. External Templates
Reuse HTML fragments by specifying a `template` attribute (automatically appends `.html`).

```html
<emerald template="header"></emerald>
```

### 5. URL Parameters
Capture variables from the URL using `:` syntax and inject them into your templates or queries.

```html
<!-- URL: #!/user/alice -->
<emerald route="user/:username" data="users" select="{{:username}}" selector="name">
    <h1>Profile of {{name}}</h1>
</emerald>
```

## API Reference

### `Emerald.init(options)`
Initializes the framework.
- `options.base`: The base path for routing (default: `window.location.pathname + "/#!/"`).
- `options.selector`: The HTML tag name to look for (default: `"emerald"`).

### `Emerald.update(element)`
Manually re-renders an element using its original template backup.

## Demo
Check out the `demo/` folder for a complete working example!
