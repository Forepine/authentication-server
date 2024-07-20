# Dashboard Authentication
##### A centralized authentication module for TSP Dashboard

## Features

- Create & manage an organization(s) and define their scopes
- Create & manage an user(s) and their role and permission

### Base URL: `http://localhost:7005/v1`

### Postman Collection URL: https://solar-space-439639.postman.co/workspace/Auth-Module~f1b1abde-3749-4a6a-a3fb-267dc8eab57d/folder/33632274-26d885a4-8e91-43cf-b6d8-f381a4d80b94?ctx=documentation

# Auth

#### Create/Register Organization
```js
[POST] /auth/register
```

**Payload:**

| Name          | Type     | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| company_name* | string   | Name of the company                                      |
| email*        | string   | E-mail of the company                                    |
| gst*          | alphanum | GST number                                               |
| type          | enum     | Type of Org: ['AI', 'Biller', 'plutos ONE']. Default: AI |
| name*         | string   | Name of the default user                                 |
| scopes*       | string[] | Scopes access that an organization can have              |
| phone*        | string   | Phone number                                             |
| password*     | string   | Password to secure account                               |

##### NOTE - Add type = 'plutos ONE' allow plutos to access internal APIs as well

[For complete reference click here](http://localhost:7005/api#/Auth%20Controller/AuthController_register)

**Response:**
```json
{
    "company_name": "ABC",
    "phone": "8888888888",
    "gst": "NGNSN8DX71LB1CM",
    "type": "Biller",
    "status": "Active",
    "client_key": "a259f2a2-1419-4ae4-9c9d-1f428bc3976d",
    "client_secret": "$2b$10$OM52cF9fSsqfs44kqoBkbOlaAoIlC.XtpSw.iNNRojyT4mS1.OJQe",
    "scopes": "read_bills read_packs",
    "org_id": 1,
    "email": "Colby_Carroll10@gmail.com",
    "name": "Emile",
    "access_id": 1,
    "user_id": 3,
    "created_at": "2024-04-12T09:44:24.008Z",
    "updated_at": "2024-04-12T09:44:24.008Z",
    "role": "Super Admin"
}
```

#### Login
```js
[POST] /auth/login
```

**Payload:**

| Name      | Type   | Description                                                        |
| --------- | ------ | ------------------------------------------------------------------ |
| email*    | string | E-mail for unique identity                                         |
| password* | string | Password to ensure that only authorized person is trying to access |
| org_id*   | number | org_id will let you enter in your assoicated organization          |

[For complete reference click here](http://localhost:7005/api#/Auth%20Controller/AuthController_login)

**Response:**
```json
{
    "token": "1c63ba3d12f3d00d8b7fc9233c373dbf:c1766deef38ae9f18b3806e7246ff1403dce2c7389c3bd40281e1c0d256b73156df2679653d5334a02a1730051ab109ada85ea37fee175c70dddfb524f580957c6d4f8f1366611e9a7bede65f1c83b6b05accb7d7e901dc973b9e641116cc57aa8267d5e66479ba85c7aadd4d5b75c81a16ed8895805fd0cfd9860230a50192d193606047c0aab4d388b77072bfe1768f520dee87e7205a36a2922c55f955c0b44008277e0dc4784db41198d98beddab2cce165d9a37d789a47f20f4404d591101e72e29048878c2b6071ad9fa44d8bb51a449c5e2b1b1d7a48c21def678ede5a611f5cc575492b4bab4b1931a017af4",
    "created_at": "2024-04-09T07:04:38.095Z"
}
```

#### Forgot Password
```js
[POST] /auth/forgot-password
```

**Payload:**

| Name    | Type   | Description                                |
| ------- | ------ | ------------------------------------------ |
| email*  | string | E-mail, your unique identity               |
| org_id* | number | org_id will help to find your organization |

[For complete reference click here](http://localhost:7005/api#/Auth%20Controller/AuthController_forgotPassword)

**Response:**
```json
{
    "token": "token"
}
```

#### Verify Access Token
```js
[POST] /auth/verify-token
```

**Parameter:**

| Name   | Type   | Description                   |
| ------ | ------ | ----------------------------- |
| token* | Bearer | Access token for verification |

[For complete reference click here](http://localhost:7005/api#/Auth%20Controller/AuthController_verifyAccessToken)

**Response:**
```json
{
    "success": true,
    "token": "Valid access token"
}
```

# Users

### Create an user
```js
[POST] /users
```

**Payload**

| Name         | Type     | Description                                                          |
| ------------ | -------- | -------------------------------------------------------------------- |
| email*       | string   | E-mail of the user                                                   |
| name*        | string   | Name of the user                                                     |
| role_id*     | number   | User role, must be one of them('Admin','Developer','Operational',..) |
| permissions* | object[] | Give specific routes & CRUD operation permission(s) to user          |
| password*    | string   | Set an initial password for the user, later can change               |

[For complete reference click here](http://localhost:7005/api#/User%20Controller/UserController_createUser)

**Response:**
```json
{
    "org_id": 2,
    "email": "Jena9@yahoo.com",
    "name": "Kayley",
    "status": "Active",
    "access_id": 4,
    "user_id": 4,
    "created_at": "2024-04-16T06:40:01.165Z",
    "updated_at": "2024-04-16T06:40:01.165Z",
    "role": "Accountant"
}
```

### Get Users
```js
[GET] /users?offset=1&limit=3
```

[For complete reference click here](http://localhost:7005/api#/User%20Controller/UserController_getUsers)

**Response:**
```json
[
 {
        "name": "Kayley",
        "email": "Jena9@yahoo.com",
        "user_id": 4,
        "org_id": 2,
        "status": "Active",
        "role": "Accountant",
        "created_at": "2024-04-18T05:02:02.258Z",
        "updated_at": "2024-04-18T05:02:02.258Z",
        "permissions": [
            {
                "slug": "wallet",
                "allow_read": true,
                "allow_update": true,
                "allow_delete": false,
                "allow_create": false
            },
            {
                "slug": "refund",
                "allow_read": true,
                "allow_update": true,
                "allow_delete": false,
                "allow_create": true
            }
        ]
    },
    ...
]
```

### Get User by id
```js
[GET] /users/{user_id}
```

[For complete reference click here](http://localhost:7005/api#/User%20Controller/UserController_getUserById)

**Response:**
```json
{
    "user_id": 2,
    "org_id": 1,
    "email": "Alva_Hessel27@yahoo.com",
    "name": "Dario",
    "status": "Active",
    "role_id": 4,
    "created_at": "2024-04-18T05:02:02.258Z",
    "updated_at": "2024-04-18T05:02:02.258Z",
    "role": "Accountant",
    "permission": [
        {
            "slug": "wallet",
            "allow_read": true,
            "allow_create": false,
            "allow_update": true,
            "allow_delete": false
        },
        {
            "slug": "refund",
            "allow_read": true,
            "allow_create": false,
            "allow_update": true,
            "allow_delete": false
        }
    ]
}
```

### Update User (Logged In User)
```js
[PUT] /users
```

**Payload:**

| Name  | Type   | Description          |
| ----- | ------ | -------------------- |
| name* | string | New name of the user |

[For complete reference click here](http://localhost:7005/api#/Users%20Controller/UserController_updateUser)
**Response:**
```json
{
    "message": "User updated successfully"
}
```

### Update User by id (Super Admin and Admin)
```js
[PUT] /users/{user_id}
```

**Payload:**

| Name         | Type     | Description                         |
| ------------ | -------- | ----------------------------------- |
| permissions* | object[] | Add or remove permission of an user |
| role_id*     | number   | Change or update user's roler       |

[For complete reference click here](http://localhost:7005/api#/Users%20Controller/UserController_updateUserById)
**Response:**
```json
{
    "message": "User with id: 2 updated successfully"
}
```

### Delete User
```js
[DELETE] /users/?user_id={user_id}
```

**Parameter:**

| Name     | Type   | Description             |
| -------- | ------ | ----------------------- |
| user_id* | number | To delete user by Id(s) |

**Response:**
```json
{
    "message": "User(s) with id: 3, 4 deleted successfully"
}
```

### Change Password
```js
[PUT] /users/change-password
```

**Parameter:**

| Name             | Type   | Description            |
| ---------------- | ------ | ---------------------- |
| password         | string | Password to set        |
| confirm_password | string | Confirm above password |

[For complete reference click here](http://localhost:7005/api#/User%20Controller/UserController_updatePassword)
**Response:**
```json
{
    "message": "Password updated successfully"
}
```

### User profile
```js
[GET] /users/profile
```

[For complete reference click here](http://localhost:7005/api#/User%20Controller/UserController_getProfile)
**Response:**
```json
{
    "user_id": 10,
    "org_id": 4,
    "email": "Roscoe66@hotmail.com",
    "name": "John Doe",
    "status": "Active",
    "role_id": 1,
    "created_at": "2024-04-17T06:06:07.672Z",
    "updated_at": "2024-04-17T06:06:07.672Z",
    "role": "Super Admin",
    "permission": [
        {
            "slug": "transactions",
            "allow_read": true,
            "allow_create": true,
            "allow_update": true,
            "allow_delete": true
        },
        {
            "slug": "settlements",
            "allow_read": true,
            "allow_create": true,
            "allow_update": true,
            "allow_delete": true
        },
        {
            "slug": "refunds",
            "allow_read": true,
            "allow_create": true,
            "allow_update": true,
            "allow_delete": true
        },
        {
            "slug": "users",
            "allow_read": true,
            "allow_create": true,
            "allow_update": true,
            "allow_delete": true
        }
    ]
}
```

# Organization

### Get organization
```js
[GET] /organizations
```

###### Logged in user can get organization detail

[For complete reference click here](http://localhost:7005/api#/Organization%20Controller/OrganizationController_getOrg)

**Response:**
```json
{
    "org_id": 2,
    "company_name": "ABC",
    "phone": "8989898989",
    "gst": "PO78P9ZMIHIi7KF",
    "type": "Agent Institution",
    "status": "Active",
    "address": null,
    "client_key": "f02c023b-0d92-4545-a014-33d741c5eddc",
    "client_secret": "$2b$10$1i9S0cC1Q.3xqv8sXr..ReBQoTtP.YlsXajy0PVOZqT7FuJOtcaDC",
    "scopes": "read_bills read_packs",
    "created_at": "2024-04-09T06:57:18.192Z",
    "updated_at": "2024-04-09T06:57:18.192Z"
}
```

### Update organization
```js
[PUT] /organizations
```

##### Logged in user(Super Admin) can update an organization

**Payload:**

| Name         | Type     | Required |
| ------------ | -------- | -------- |
| company_name | string   | False    |
| scopes       | string[] | false    |
| phone        | string   | false    |
| status       | string   | false    |

[For complete reference click here](http://localhost:7005/api#/Organization%20Controller/OrganizationController_updateOrg)
**Response:**
```json
{
    "message": "Organization 'ABC' updated successfully"
}
```

### Update organization's client secret
```js
[PATCH] /organizations/credential
```

##### Super Admin & Plutos can update an organization's client secret

[For complete reference click here](http://localhost:7005/api/#/Organizations%20Controller/OrganizationController_updateClientSecret)
**Response:**
```json
{
    "message": "Client secret updated successfully"
}
```

### Delete Organization
```js
[DELETE] /organizations
```

##### Logged in user(Super Admin) can delete an organization

[For complete reference click here](http://localhost:7005/api#/Organization%20Controller/OrganizationController_deleteOrg)

**Response:**
```json
{
    "message": "Organization with id: 2 deleted successfully"
}
```

# Roles

### Create role
```js
[POST] /roles
```

**Payload**

| Name  | Type   | Description  |
| ----- | ------ | ------------ |
| role* | string | Add new role |

[For complete reference click here](http://localhost:7005/api#/Roles%20Controller/RolesController_addRole)

**Response:**
```json
{
    "message": "New role addedd successfully",
    "role": "Tester",
    "id": 3,
    "created_at": "2024-04-17T07:57:52.098Z",
    "updated_at": "2024-04-17T07:57:52.098Z"
}
```

### Get roles
```js
[GET] /roles
```

[For complete reference click here](http://localhost:7005/api#/Roles%20Controller/RolesController_getRoles)

**Response:**
```json
[
    {
        "id": 1,
        "role": "Super Admin",
        "created_at": "2024-04-12T09:44:24.008Z",
        "updated_at": "2024-04-12T09:44:24.008Z"
    },
    {
        "id": 2,
        "role": "Admin",
        "created_at": "2024-04-12T09:44:28.838Z",
        "updated_at": "2024-04-12T09:44:28.838Z"
    },
    {
        "id": 3,
        "role": "Accountant",
        "created_at": "2024-04-12T09:44:43.328Z",
        "updated_at": "2024-04-12T09:44:43.328Z"
    },
    ...
]
```

### Get role
```js
[GET] /role/{role_id}
```

[For complete reference click here](http://localhost:7005/api#/Roles%20Controller/RolesController_getRole)

**Response:**
```json
{
        "id": 3,
        "role": "Accountant",
        "created_at": "2024-04-12T09:44:43.328Z",
        "updated_at": "2024-04-12T09:44:43.328Z"
}
```

### Delete role(s)
```js
[DELETE] /role?id=1&id=3
```

[For complete reference click here](http://localhost:7005/api#/Roles%20Controller/RolesController_deleteRoles)

**Response:**
```json
{
    "message": "Role with id(s): 1,3 deleted successfully"
}
```


# Modules

### Create module
```js
[POST] /modules
```

**Payload**

| Name    | Type   | Description                                         |
| ------- | ------ | --------------------------------------------------- |
| module* | string | Add a module, Ex: 'transaction', 'settlements', ... |

[For complete reference click here](http://localhost:7005/api#/Modules%20Controller/ModulesController_createModule)

**Response:**
```json
{
    "message": "Module added successfully",
    "module": "Refund",
    "id": 16,
    "created_at": "2024-04-17T07:58:28.282Z",
    "updated_at": "2024-04-17T07:58:28.282Z"
}
```

### Get modules
```js
[GET] /modules
```

[For complete reference click here](http://localhost:7005/api#/Modules%20Controller/ModulesController_getModules)

**Response:**
```json
[
    {
        "id": 1,
        "module": "settlements",
        "created_at": "2024-04-15T07:19:52.727Z",
        "updated_at": "2024-04-15T07:19:52.727Z"
    },
    {
        "id": 2,
        "module": "wallets",
        "created_at": "2024-04-15T07:19:56.310Z",
        "updated_at": "2024-04-15T07:19:56.310Z"
    },
    ...
]
```

### Get module
```js
[GET] /modules/{module_id}
```

[For complete reference click here](http://localhost:7005/api#/Modules%20Controller/ModulesController_getModule)

**Response:**
```json
{
    "id": 2,
    "module": "wallets"
}
```

### Delete module(s)
```js
[DELETE] /modules?id=11&id=12
```

[For complete reference click here](http://localhost:7005/api#/Modules%20Controller/ModulesController_deletModules)

**Response:**
```json
{
    "message": "Module with id(s): 11,12 deleted succesfully"
}
```

### Update module
```js
[UPDATE] /modules/{module_id}
```

**Payload:**

| Name   | Type   | Description               |
| ------ | ------ | ------------------------- |
| module | string | Update or rename a module |

[For complete reference click here](http://localhost:7005/api#/Modules%20Controller/ModulesController_updateModule)

**Response:**
```json
{
    "message": "Module with id: 7 updated successfuly"
}
```

# A brief explantation about the Organization & Users

## What is an Organization?
- An organization, in our platform's context, is a structured entity formed when a company registers. Within this entity, we set up a "Super Admin" user with full authority. Upon registration, this user is created, allowing access to the organization's functionalities such as user management. Logging in with the provided email and password generates an access token for executing tasks like creating, updating, and deleting users.

## What is an User?
- Users can be created within an organization, each assigned a specific role and set of permissions that determine their level of access. These roles and permissions dictate what actions users are allowed to perform within the organization's framework.

