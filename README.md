# map-builder

`yarn install` - Install the dependencies

`yarn run dev` - Run locally

## Controlls in game

```
When in free mode
    n - turn map editor on / off
    m - show minimap
    h - hide / show walls

When in map editor:
    1 - Thin Walls editor
    2 - Floor Editor
    3 - Furniture Editor
    4 - Walls editor (the old ones taking up entire grid)

When tool is selected:
    q - placing mode
    w - deletion mode if available
    e - next texture if available
    r - rotate if available
```

## Notable parts of the code
### MapManager.ts

Holds logic and data needed to handle map properly
### MapEditor.ts and the MapEditorTools

All of the tooling needed for editing features to work
### AStar.ts

Custom implementation of A* algorithm to make pathfinding work with "thin" walls

### GameScene.ts

Main Phaser scene where it all happens

### UiScene.ts

Used as a vessel to always display minimap (and other UI components in the future) always above the GameScene