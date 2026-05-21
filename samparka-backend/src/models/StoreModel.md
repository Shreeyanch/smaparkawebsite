# MongoDB Models Documentation

This document describes all MongoDB models in the Samparka platform and their relationships to the core Store and User entities.

---

## Core Models

### Store (`storeModel.js`)
The central entity representing a merchant/business in the multi-tenant system.

| Field | Type | Description |
|-------|------|-------------|
| name | String | Store name |
| location | String | Physical location |
| phone | String | Contact number |
| logo | String | Store logo URL |
| url | String | Unique subdomain identifier |
| user | ObjectId[] | Array of User references (admins) |
| outlets | ObjectId[] | Array of Outlet references |
| loyaltyCard | Object | Loyalty card configuration |
| services | Object | Enabled services (loyalty, reservation, ecommerce, games) |
| subscriptionStartDate | Date | Subscription period start |
| subscriptionEndDate | Date | Subscription period end |
| type | String | Store type (retail/food/service) |
| status | String | active/deactive |

### User (`userModel.js`)
Admin users who manage stores.

| Field | Type | Description |
|-------|------|-------------|
| email | String | User email (unique) |
| password | String | Hashed password (optional for OAuth) |
| googleId | String | Google OAuth ID |
| authProvider | String | local/google |
| role | String | User role |
| status | String | active/inactive/blocked/pending_verification |
| emailVerified | Boolean | Email verification status |

### Customer (`customerModel.js`)
End customers who participate in store loyalty programs.

| Field | Type | Description |
|-------|------|-------------|
| name | String | Customer name |
| email | String | Customer email |
| phone | Number | Phone number |
| points | Number | Current loyalty points |
| totalPoints | Number | Lifetime points earned |
| tier | String | Loyalty tier |
| **store** | ObjectId | **References Store** |

**Indexes:** Compound unique indexes on (store, email) and (store, phone)

---

## Models Referencing Store

### Category (`categoryModel.js`)
Product categories for a store.

| Field | Type | Reference |
|-------|------|-----------|
| name | String[] | Array of category names |
| **store** | ObjectId | **Store** |

### Product (`productModel.js`)
E-commerce products.

| Field | Type | Reference |
|-------|------|-----------|
| name | String | Product name |
| price | Number | Original price |
| calculatedPrice | Number | Price after discount |
| category | String | Category name |
| stock | Number | Stock count (nullable) |
| **storeId** | ObjectId | **Store** |

### Order (`orderModel.js`)
E-commerce orders.

| Field | Type | Reference |
|-------|------|-----------|
| userName | String | Customer name |
| userPhone | String | Customer phone |
| products | Array | Ordered products (refs Product) |
| totalAmount | Number | Order total |
| status | String | Order status |
| **storeId** | ObjectId | **Store** |

### Points (`pointsModel.js`)
Store-level points configuration.

| Field | Type | Reference |
|-------|------|-----------|
| points | Number | Points value |
| billID | String | Bill identifier |
| **store** | ObjectId | **Store** (unique) |

### PointsHistory (`pointsHistoryModel.js`)
Customer points transaction history.

| Field | Type | Reference |
|-------|------|-----------|
| points | Number | Points earned/spent |
| billID | String | Transaction bill ID |
| outlet | String | Outlet name |
| remarks | String | Transaction notes |
| **store** | ObjectId | **Store** |
| **customer** | ObjectId | **Customer** |

### Outlet (`outletModel.js`)
Store branch locations.

| Field | Type | Reference |
|-------|------|-----------|
| location | String | Branch location |
| phone | String | Branch phone |
| mapLink | String | Google Maps link |
| **store** | ObjectId | **Store** |

### OutletPoints (`outletPointsModel.js`)
Points configuration per outlet.

| Field | Type | Reference |
|-------|------|-----------|
| points | Number | Points value |
| billID | String | Bill ID |
| **outlet** | ObjectId | **Outlet** |
| **store** | ObjectId | **Store** |

**Indexes:** Compound unique index on (store, outlet)

### PrintPoints (`printPointsModel.js`)
Points for print/receipt tracking.

| Field | Type | Reference |
|-------|------|-----------|
| points | Number | Points value |
| billID | String | Bill ID |
| outlet | ObjectId | Outlet (optional) |
| **store** | ObjectId | **Store** |

### Offer (`offerModel.js`)
Promotional offers.

| Field | Type | Reference |
|-------|------|-----------|
| title | String | Offer title |
| description | String | Offer description |
| image | String | Offer image URL |
| startDate | Date | Start date |
| expiryDate | Date | Expiry date |
| isActive | Boolean | Active status |
| **store** | ObjectId | **Store** |

### Reward (`rewardModel.js`)
Loyalty rewards that customers can claim.

| Field | Type | Reference |
|-------|------|-----------|
| name | String | Reward name |
| description | String | Reward description |
| points | String | Points required |
| tier | String | Required tier |
| type | String | standard/constant |
| redeemable | Boolean | Can be redeemed |
| **store** | ObjectId | **Store** |

### Redemption (`redemptionModel.js`)
Customer reward redemptions.

| Field | Type | Reference |
|-------|------|-----------|
| status | String | pending/claimed/expired |
| billID | String | Bill ID |
| redeemDate | Date | Redemption date |
| expiryDate | Date | Expiry date |
| **store** | ObjectId | **Store** |
| **customer** | ObjectId | **Customer** |
| **reward** | ObjectId | **Reward** |

### Reservation (`reservationModel.js`)
Customer reservations/bookings.

| Field | Type | Reference |
|-------|------|-----------|
| services | String[] | Reserved services |
| tableNumber | String | Table number |
| date | Date | Reservation date |
| time | String | Reservation time |
| status | String | pending/confirmed/cancelled/noShow/completed |
| **store** | ObjectId | **Store** |
| **customer** | ObjectId | **Customer** |

### ReservationSetting (`reservationSettingModel.js`)
Store reservation configuration.

| Field | Type | Reference |
|-------|------|-----------|
| images | String[] | Gallery images |
| services | Array | Available services |
| autoConfirmation | Boolean | Auto-confirm reservations |
| timeSlots | Array | Available time slots |
| **store** | ObjectId | **Store** (unique) |

### Notification (`notificationModel.js`)
Push notifications sent to customers.

| Field | Type | Reference |
|-------|------|-----------|
| title | String | Notification title |
| message | String | Notification body |
| receivers | Array | Recipients with read status |
| **store** | ObjectId | **Store** |
| receivers.customer | ObjectId | **Customer** |

### NotificationLog (`NotificationLog.js`)
Log of sent notifications.

| Field | Type | Reference |
|-------|------|-----------|
| sentAt | Date | Send timestamp |
| **storeId** | ObjectId | **Store** |
| **customerId** | ObjectId | **Customer** |

**Indexes:** Compound unique index on (storeId, customerId)

### MailSMS (`mailSMSModel.js`)
Email and SMS template configuration.

| Field | Type | Reference |
|-------|------|-----------|
| mailAfterLogin | Object | Login email template |
| mailOnBirthday | Object | Birthday email template |
| smsAfterPointEarned | Object | Points SMS template |
| (many more templates) | Object | Various notification templates |
| **store** | ObjectId | **Store** (unique) |

### WhatsappAccount (`whatsappAccountModel.js`)
WhatsApp Business API credentials.

| Field | Type | Reference |
|-------|------|-----------|
| phoneNumberId | String | WhatsApp phone number ID |
| accessToken | String | API access token |
| isActive | Boolean | Active status |
| **storeId** | ObjectId | **Store** |

### WhatsappTemplate / Template (`whatsappTemplate.js`)
WhatsApp message templates.

| Field | Type | Reference |
|-------|------|-----------|
| name | String | Template name |
| body | String | Message body |
| bodyVariables | Array | Variable placeholders |
| buttons | Array | Call-to-action buttons |
| **storeId** | ObjectId | **Store** |

### WhatsappMedia (`WhatsappMedia.js`)
Uploaded WhatsApp media files.

| Field | Type | Reference |
|-------|------|-----------|
| mediaId | String | WhatsApp media ID |
| fileName | String | Original filename |
| **storeId** | ObjectId | **Store** |

### WheelSegment (`wheelSegment.js`)
Spin-the-wheel game segments.

| Field | Type | Reference |
|-------|------|-----------|
| label | String | Segment label |
| color | String | Segment color |
| value | Number | Segment value |
| type | String | points/rewards/neutral |
| **store** | ObjectId | **Store** |
| reward | ObjectId | **Reward** (optional) |

---

## Models Referencing User

### Store (`storeModel.js`)
| Field | Type | Reference |
|-------|------|-----------|
| **user** | ObjectId[] | **User** (array of admins) |

### Message (`messageModel.js`)
Scheduled messages.

| Field | Type | Reference |
|-------|------|-----------|
| title | String | Message title |
| message | String | Message content |
| dateandtime | Date | Scheduled time |
| status | String | Message status |
| **createdBy** | ObjectId[] | **User** |

### Subscription (`Subscription.js`)
Web push notification subscriptions.

| Field | Type | Reference |
|-------|------|-----------|
| subscription | Object | Push subscription object |
| **userId** | ObjectId | **User** (unique) |

---

## Standalone Models (No Store/User Reference)

### SMSFee (`smsFeeModel.js`)
Global SMS pricing configuration.

| Field | Type | Description |
|-------|------|-------------|
| amount | Number | SMS fee per message |

### Vote (`Vote.js`)
Voting/contest system (standalone feature).

| Field | Type | Description |
|-------|------|-------------|
| contestantName | String | Contestant name |
| votersPhoneNumber | Number[] | Voter phone numbers |
| vote | Number | Vote count |

### WhatsappChat (`WhatsappChat.js`)
WhatsApp conversation messages.

| Field | Type | Description |
|-------|------|-------------|
| phone | String | Phone number |
| direction | String | in/out |
| message | String | Message content |
| templateId | String | Template reference |

### WhatsappOutgoing (`WhatsappOutgoing.js`)
Outgoing WhatsApp message log.

| Field | Type | Reference |
|-------|------|-----------|
| phone | String | Recipient phone |
| messageId | String | WhatsApp message ID |
| **templateId** | ObjectId | **Template** |

---

## Entity Relationship Diagram

```
                                    ┌─────────────┐
                                    │    User     │
                                    │  (Admin)    │
                                    └──────┬──────┘
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                              ▼            ▼            ▼
                        ┌──────────┐ ┌──────────┐ ┌──────────────┐
                        │ Message  │ │Subscription│ │    Store     │
                        └──────────┘ └──────────┘ └──────┬───────┘
                                                         │
           ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
           │                    │                        │                        │                    │
           ▼                    ▼                        ▼                        ▼                    ▼
    ┌──────────────┐    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    ┌──────────────┐
    │   Customer   │    │    Outlet    │         │   Category   │         │   Product    │    │   MailSMS    │
    └──────┬───────┘    └──────┬───────┘         └──────────────┘         └──────┬───────┘    └──────────────┘
           │                   │                                                  │
           │                   ▼                                                  │
           │            ┌──────────────┐                                         │
           │            │ OutletPoints │                                         │
           │            └──────────────┘                                         │
           │                                                                      │
           │            ┌──────────────┐                                         ▼
           ├───────────►│PointsHistory │                                  ┌──────────────┐
           │            └──────────────┘                                  │    Order     │
           │                                                              └──────────────┘
           │            ┌──────────────┐
           ├───────────►│ Reservation  │◄─────────────────────┐
           │            └──────────────┘                      │
           │                                           ┌──────────────┐
           │            ┌──────────────┐               │ ReservationSetting │
           ├───────────►│ Notification │               └──────────────┘
           │            └──────────────┘
           │
           │            ┌──────────────┐         ┌──────────────┐
           └───────────►│  Redemption  │────────►│    Reward    │
                        └──────────────┘         └──────┬───────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │ WheelSegment │
                                                 └──────────────┘

    ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    │                                    STORE-RELATED MODELS                                          │
    │                                                                                                  │
    │  Points, PrintPoints, Offer, WhatsappAccount, WhatsappTemplate, WhatsappMedia, NotificationLog   │
    └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary Statistics

| Category | Count | Models |
|----------|-------|--------|
| Core Models | 3 | Store, User, Customer |
| Store-referencing | 21 | Category, Product, Order, Points, PointsHistory, Outlet, OutletPoints, PrintPoints, Offer, Reward, Redemption, Reservation, ReservationSetting, Notification, NotificationLog, MailSMS, WhatsappAccount, WhatsappTemplate, WhatsappMedia, WheelSegment |
| User-referencing | 3 | Store (user[]), Message, Subscription |
| Customer-referencing | 5 | PointsHistory, Redemption, Reservation, Notification, NotificationLog |
| Standalone | 4 | SMSFee, Vote, WhatsappChat, WhatsappOutgoing |

---

## Notes

1. **Multi-tenancy**: All customer-facing data is scoped to a Store via foreign key references
2. **Unique constraints**: Several models have compound unique indexes (e.g., Customer per store, OutletPoints per store+outlet)
3. **Cascading**: Deleting a Store would orphan many related documents - consider implementing cascading deletes
4. **Field naming inconsistency**: Some models use `store` while others use `storeId` - consider standardizing
