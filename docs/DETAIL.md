# Task queue

A task-queue View in the conversation tab row, next to views such as Trajectory and Statistics.

## Layout

- Title, description, and project name on top; a compact item list in the middle (hairline dividers, no cards); **the input row and the auto-run switch are pinned to the bottom**.
- Styling follows DSH's own controls: theme radius and color tokens, a brand-filled primary button, and quiet edit/delete actions that appear on hover.
- Order: **finished items on top, newly added items at the bottom**; failed and running items come before the pending queue.

## Features

- Record items in the view; the list persists in this browser across reloads.
- **Items are isolated per project**: every Workspace keeps its own list, and a session in another project shows that project's items only.
- **Per-item scope** (the selector beside the priority):
  - `This chat`: appears only in this conversation and is sent from it.
  - `All`: appears in every conversation of the project, for items shared across chats.
- Set a priority (high / medium / low) per item; an existing item's priority chip is a selector, so it can be changed in place.
- **Click an item's title to edit it** (the cursor turns into a text caret): Enter saves, Shift+Enter adds a line, Esc cancels, and **clicking anywhere outside the item saves and leaves edit mode**. Delete stays a quiet icon revealed on row hover.
- Send an item to the current conversation as a queued turn with one click.
- **Auto-run is per conversation**: the switch affects the current chat only. While it is on, the plugin sends the highest-priority pending item visible to this chat whenever it is idle, continuing until the queue is empty — even while you are watching another view such as Chat.
- Each item reports its progress: pending, running, done, or failed with the error text, plus whether it belongs to this chat or to all chats.

## Notes

- Items live in this browser's local storage, grouped by Workspace; they are not shared across devices or browsers.
- Other chats' `This chat` items stay hidden here, summarized as `N item(s) in other chats`.
- Priority and scope are remembered per conversation; the auto-run switch is also per conversation and starts off.
