# API Authentication
##### A centralized authentication module for TSP APIs

### Features

- Generate access token based on valid client key & client secret

### Base URL: `http://localhost:7006/v1`

### Postman Collection URL: https://solar-space-439639.postman.co/workspace/Auth-Module~f1b1abde-3749-4a6a-a3fb-267dc8eab57d/folder/33632274-fdcfd01b-38da-4efd-9232-7c16848a6cb6?ctx=documentation

### Get token
```js
/auth/token
```

**Payload:**

| Name           | Type   | Description                        |
| -------------- | ------ | ---------------------------------- |
| client_key*    | string | client_key of your organization    |
| client_secret* | string | client_secret of your organization |
| scopes*        | string | To gain access to the scope(s)     |


[For complete reference click here](http://localhost:7006/api#/API%20Controller/AuthController_generateAccessToken)

**Response:**
```json
{
    "access_token": "81f8f825ec467e821e7a25e8e0036697:b13ff038045ab5ecca1f52b1e3b914b86da893eb4038312953048bc4db86ae3616ed83b6853f8c3f3117273ff20377794e43095b5c7aacd6a0ae33185081a334ec319b2a9c5a9a01326e693153012df96cb1c4ea04bc86132a62aa6d756f820248fcdacce14c457bd49ed524adfcbd80871c125b102726f8432a07b4b39d7c775d0d3b4ae64636fee68c810fc89082632953d3f16d65f269a9212a60a3289e53458ed2dcc9023d9543a717197c97018b45c59d71a2bd02c0cb4ce6e2e565f2f58ff23ad52236e1796d072b2c7f6ef9310941fe231ccdd2cc227784d1048e435dc46fd691cbf98e3a248d42244201a6ae08fdfdfbccd61fc61d5e251477c47cbc67d81a18bfeae99f68a64da27ed1397915a3ef3ee5a2971fcc38a4a4e3b4fd337a14849c696aa7ebac6fa0b4711d0e1aff123b87f6b194333a7a23bde295ce11",
    "token_type": "Bearer",
    "scope": "read_bills",
    "created_at": "2024-04-11T10:46:45.764Z"
}
```