 enum ORGANIZATION_TYPE {
    AI = 'Agent Institution',
    BILLER = 'Biller',
    OTHER = 'Other'
}

 enum STATUS {
    ACTIVE = 'Active',
    DEACTIVE = 'Deactive'
}

 enum ROLE {
    OWNER = 'owner',
    MASTER_ADMIN = 'master admin',
    SUPER_ADMIN = 'super admin',
    ADMIN = 'admin',
    SALES = 'sales',
    DEVELOPER = 'developer',
    OPERATIONAL = 'operational team',
    MANAGER = 'manager'
}

enum MAIL_SUBJECT {
    WELCOME = 'Welcome',
    FORGOT_PASSWORD = 'Forgot Password'
}

 enum Scopes {
    READ_BILLS = 'read_bills',
    READ_PLANS = 'read_plans',
    READ_PACKS = 'read_packs',
    GET_BILL_MOB = 'get_bill_mob',
    GET_BILL_INT = 'get_bill_int',
    GET_BILL_AGT = 'get_bill_agt',
    PAY_BILL_INT = 'pay_bill_int',
    PAY_BILL_MOB = 'pay_bill_mob',
    PAY_BILL_AGT = 'pay_bill_agt',
    READ_BILLERS = 'read_billers',
    READ_REGIONS = 'read_regions',
    READ_CIRCLES = 'read_circles',
    BILL_VALIDATE = 'bill_validate',
    READ_OPERATORS = 'read_operators',
    RAISE_COMPLAINT = 'raise_complaint',
    GET_BILLER_PLANS = 'get_biller_plans',
    READ_TRANSACTIONS = 'read_transactions',
    GET_BILLER_STATUS = 'get_biller_status',
    REGISTER_COMPLAIN = 'register_complain',
    READ_AGENT_BALANCE = 'read_agent_balance',
    CREATE_TRANSACTIONS = 'create_transactions',
    GET_BILLER_BY_REGION = 'get_biller_by_region',
    READ_OPERATOR_CIRCLE = 'read_operator_circle',
    CHECK_COMPLAIN_STATUS = 'check_complain_status',
    GET_BILLER_CATEGORIES = 'get_biller_categories',
    GET_BILLER_BY_CATEGORY = 'get_biller_by_category',
    CHECK_COMPLAINT_STATUS = 'check_complaint_status',
    READ_BILLER_CATEGORIES = 'read_biller_categories',
    BILL_PAYMENT_VALIDATION = 'bill_payment_validation',
    GET_BILL_PAYMENT_TXN_STATUS = 'get_bill_payment_txn_status',
}

export{
    ROLE,
    STATUS,
    Scopes,
    MAIL_SUBJECT,
    ORGANIZATION_TYPE,
}