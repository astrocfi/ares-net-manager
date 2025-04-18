# Overview

The name of the project is "ARES Net Manager".

This project contains a system for aiding amateur radio operators who are performing the duties of net control during an event (drill, exercise, public service event, or real emergency). It keeps track of which operators have checked in or out of the net, how long it has been since they have last been communicated with, and what roles they are currently playing. Multiple events can be handled, with the user choosing which event to work with when they first invoke the program.

It does this using a full stack design with a Python backend running Django and a JavaScript front using React. The front end is designed to run in a web browser on a computer or tablet using either a keyboard and mouse or a touch screen as an interface.

# Overall UI Features

- The UI should be simple and easy to read, with a minimum of unnecessary clutter.
- Common features should be easy to invoke using single button presses.
- For use with a touch screen, an optional on-screen keyboard should be provided as necessary.
- The display should be reactive, equally useable on a large PC monitor or on a small tablet. It should be possible to increase or decrese the font size.
- Both light and dark color themes should be provided and easily switched between.
- Menus should be avoided.
- Multiple users should be able to use the system at the same time from different browsers. They will share and see the same data, and updates by one user will be immediately visible to all other users.
- No security is required and there should be no logins or accounts.
- The front end should be written in JavaScript using the React framework and make extensive use of modern CSS features to customize the display.
- All interactions with the back end should be performed using a standard REST-like API.
- All code should be extensively commented and documented to make it easy for future understanding and modification.
- UI/UX Specifics:
  - No audible alerts will be implemented
  - No keyboard shortcuts will be provided
  - A standard on-screen keyboard will be used for all text input
  - Date and time inputs will use standard calendar and time selector widgets
  - The interface should be optimized for touch screen use

# Back End Features

- The back end should be written in modern Python using the Django framework.
- All data should be stored using Sqlite.
- All interactions with the front end should be performed using a standard REST-like API.
- All code should be extensively commented and documented to make it easy for future understanding and modification.
- It should be possible to store a database of known amateur radio operators, including:
  - Call sign (no validation required)
  - Name
  - Credentials, selected from:
    - C4
    - F3, F2, F1
    - N3, N2, N1
    - P3, P2, P1
    - MAC
    - ERO
  - An operator can have none, one, or multiple credentials
  - Credentials should be selected using checkboxes in the UI
- This list should be easy to edit using the web interface.
- A separate utility program should be provided for importing and exporting the operator database.

# Basic UI Design

## Start Up

- When a user first invokes the program through a browser, they will be presented with a simple screen that shows a list of previous events to select from, along with an option to add a new event.
- There should also be a separate option to delete an event, but it should be off to the side and made clear that it is a dangerous operation.

## Main Display

- Once an event is chosen, the display switches to the main net display.
- The net display will have a series of buttons across the top that choose the type of display from the options:
  - T Card Rack
  - Network #1
  - Network #2
  - etc.
- It should be possible to easily rename the Networks, to add a new network, and to delete an existing network. When renaming networks, options include:
  - Resource
  - Command
  - Message
  - Shadow
  - Custom Name entered by the user

### T Card Rack

- A T Card Rack looks like this: https://www.t-cardsystems.com/racks
- It contains a series of vertical strips with labels at the top. The labels at the top are customizable, but can include:
  - Resource
  - Staging
  - Command
  - Message
  - Shadow
  - Custom Name entered by the user
- Each vertical strip can contain zero or more "cards". A card contains information about a single amateur radio operator. This information can include:
  - Call sign
  - Name
  - Credentials
  - Time checked in
  - Time checked out
  - Assignment history (assignments can change over time)
  - Custom notes
- The cards should normally only display their top line, which includes the call sign, name, and credentials
- When clicked on, a card should expand to show all information and allow it to be edited.
- Cards can be dragged from one column to another.
- New cards can be added to any column.
- When a new card is created it should start by asking for the call sign. If this call sign is already known, other information should be populated from the backend database. In either case, it should be possible to edit the data (but this edit should not change the backend database in this mode).

### Net Displays

- Each net display will track a series of amateur radio operators, keeping track of:
  - Call sign
  - Name
  - Credentials
  - When the person checked in to the net
  - When the person checked out of the net (if they have)
  - When the person was last heard from
  - How long it has been since last contact, measured in minutes (this displayed value is computed from the current time and the time the person was last heard from)
  - Any custom notes
- When a new person is added it should start by asking for the call sign. If this call sign is already known, other information should be populated from the backend database. In either case, it should be possible to edit the data (but this edit should not change the backend database in this mode).
- It should be possible to sort the list of people by call sign, name, checkin time, checkout time, or how long it has been since they have last been heard from.
- It should be possible to set a single "health and welfare" time, expressed in minutes. When any operator has not been heard from in that amount of time, their entry should be changed to a different color to make it obvious.
- It should be easy to indicate that a person has been heard from with a single touch. This will reset their health and welfare timer.
- It should be easy to indicate that a person has checked out of the net. At this point their checkout time will be set to the current time and they will be placed in a separate list on the screen. It is no longer necessary to keep track of their health and welfare status.

# Implementation Concepts

- The back end should keep these Sqlite databases:
  - One database containing all events. Each event will have the complete status (e.g. T Card Rack status, nets, status for each net, complete info for each operator). It should be possible to exit the program and restart it using this database and get exactly the screen where it left off.
  - One database containing known amateur operators (name, callsign, credentials, notes).
- Events should never be permanently deleted. Instead, they should be marked as inactive and hidden from the main interface. An option should be provided to view inactive events.
- Each event should store the following metadata:
  - Date and time created
  - Event name
  - Location (city or county)
  - Active/inactive status
- Real-time updates:
  - Changes made by any user should be immediately visible to all other users
  - No conflict resolution is needed as there will only be a few concurrent users
  - All changes should be tracked and stored in a history
  - Each change should be reversible (undo functionality)
  - The system should maintain a history of all changes including:
    - User edits
    - Card movements
    - Status changes
    - Any other modifications to the event state
- Activity Logging:
  - Each event should maintain a human-readable activity log
  - The log should record all operations with date and time, including:
    - Operator edits
    - T Card movements
    - Operator activity status changes
    - Network modifications
    - Any other changes to the event state
  - The log should be easily viewable within the event interface
- Technical Requirements:
  - The application should work in any modern browser (Firefox, Chrome, Safari)
  - No offline capabilities are required
  - Performance should be sufficient to prevent user confusion or annoyance
  - All updates should be processed and displayed in a timely manner
- In the front end, it should always be easy to edit the data for a particular operator (change callsign, name, credentials, notes). The interface for this should be consistent across screens (T card rack, net status displays). Depending on the display, it should also be easy to edit other screen-specific data, such as check-in/check-out time, time last heard from, etc. Ease of use is extremely important.
