## Figma React Plugin Example

### Token Spec

```json
{
  // normal token
  "color.black": {
    "$value": "#000000",
    "$type": "color"
  },

  // alias token
  "color.primary": {
    "$value": "{color.black}",
    "$type": "color"
  }
}
```
