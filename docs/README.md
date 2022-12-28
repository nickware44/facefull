# Welcome to the Facefull API documentation!
## Including files
```html
<script type="text/javascript" src="facefull/facefull.min.js" charset="utf-8"></script>
<link rel="stylesheet" href="facefull/facefull.min.css">
```

## Initialization with JavaScript
```js
facefullCreate();
// or facefullCreate(true) to init in native mode

window.addEventListener('load', function() {
    facefull.doInit();
});
```

## Working with UI components
To initialize UI components, you need to set `data-*name` HTML tag value for each component (`data-subpagename` for `Subpage` component, for example). Initialization will be automatically done on facefull initialization.

## Interacting with UI components in JS
To access a UI components from JS you need to use the appropriate collection from the `facefull` class. (`facefull.Subpages[id]`, for example). `id` must be equal to `data-*name` (`data-subpagename`, for example) HTML tag value of relevant element.

[Show all members of Facefull](Facefull.html)

## Native mode
Native mode allows you to use Facefull to create a user interface for native desktop applications using the `webview` component.
In native mode you can use built-in event system to communicate with your native desktop application backend. All you need to do is implement a `bridge` - the communication system between your application backend and the user interface.

[Learn more about Facefull bridge interface](https://github.com/nickware44/facefull/wiki/Facefull-bridge-interface)
