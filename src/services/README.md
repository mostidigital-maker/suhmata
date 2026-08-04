# Data modules

Every module follows the same layering, so a new feature can be added without
touching existing code:

```text
database (RLS)  ->  src/services/<module>.ts  ->  src/services/queries.ts  ->  components
```

- **services** hold typed, reusable fetch/mutate functions. They are the only
  place that talks to the backend client.
- **queries.ts** exposes TanStack Query option factories (stable keys, caching,
  `enabled` guards) grouped per module.
- **components** consume query factories only — never the backend client.

## Active modules

| Module | Tables | Service |
| --- | --- | --- |
| Site content | `hero_content`, `association_message`, `history`, `settings` | `content.ts` |
| Articles / News | `articles`, `categories` | `content.ts` |
| Events | `events`, `event_media` | `content.ts` |
| Gallery | `albums`, `gallery` | `content.ts` |
| Archive | `archive_items` | `content.ts` |
| Village map | `map_locations`, `map_location_media` | `content.ts` |
| Guest book | `guestbook` | `content.ts` |
| Visitor videos | `visitor_videos` | `content.ts` |
| Contributions | `contributions` | `content.ts` |
| Admin & roles | `profiles`, `user_roles` (`admin`, `editor`) | `auth.ts` |

## Future-ready modules (schema + services in place, UI to come)

| Module | Tables | Service | Notes |
| --- | --- | --- | --- |
| Payment methods | `payment_methods` | `donations.ts` | Bank / PayPal / cash entries, bilingual instructions. |
| Donation system | `donation_campaigns`, `donations` | `donations.ts` | Campaign goals + donor wall. Checkout must run server-side. |
| Family tree | `family_members` | `heritage.ts` | Self-referencing father/mother/spouse links. |
| Historical timeline | `timeline_entries` | `heritage.ts` | Year + era, published-gated. |
| Memorial pages | `memorials` | `heritage.ts` | Optionally linked to a family member. |
| Search engine | `search_index` | `search.ts` | Denormalised bilingual index, trigram-backed. |
| Email notifications | `notification_subscribers`, `notification_log` | `notifications.ts` | Double opt-in; sending happens server-side. |
| Push notifications | `notification_subscribers` (`channel = 'push'`) | `notifications.ts` | Stores endpoint + VAPID keys. |

## Security model

Every table has RLS enabled with the same shape:

- public/anon: read only published/active/approved rows,
- `is_staff(auth.uid())`: full read and write,
- `has_role(auth.uid(), 'admin')`: role and settings management.

Visitor submissions (guest book, videos, contributions, subscriptions) can only
be inserted in an unapproved/unconfirmed state.

## Performance

- Query keys are namespaced per module so invalidation stays surgical.
- List reads always project through `.limit()` / `.range()`; the gallery uses
  infinite pagination.
- Indexes exist on the columns used for ordering, filtering and search.
