import { Account, IAccount, AccountType } from '../models/Account';
import { ApiError } from '../utils/ApiError';

export const listAccounts = async (type?: AccountType) => {
  const filter = type ? { type, isActive: true } : { isActive: true };
  return Account.find(filter).sort({ code: 1 });
};

export const getAccountById = async (id: string): Promise<IAccount> => {
  const account = await Account.findById(id);
  if (!account) throw ApiError.notFound('Account not found');
  return account;
};

export const createAccount = async (data: Partial<IAccount>): Promise<IAccount> => {
  const existing = await Account.findOne({ code: data.code });
  if (existing) throw ApiError.conflict('An account with this code already exists');
  return Account.create(data);
};

export const updateAccount = async (id: string, data: Partial<IAccount>): Promise<IAccount> => {
  const account = await Account.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!account) throw ApiError.notFound('Account not found');
  return account;
};

export const seedDefaultChartOfAccounts = async (): Promise<IAccount[]> => {
  const defaults: Partial<IAccount>[] = [
    { code: '1000', name: 'Cash', type: 'asset' },
    { code: '1010', name: 'Bank Account', type: 'asset' },
    { code: '1100', name: 'Accounts Receivable', type: 'asset' },
    { code: '1200', name: 'Inventory', type: 'asset' },
    { code: '1300', name: 'Packaging Supplies', type: 'asset' },
    { code: '2000', name: 'Accounts Payable', type: 'liability' },
    { code: '2100', name: 'Sales Tax Payable', type: 'liability' },
    { code: '3000', name: "Owner's Equity", type: 'equity' },
    { code: '3100', name: 'Retained Earnings', type: 'equity' },
    { code: '4000', name: 'Sales Revenue', type: 'revenue' },
    { code: '4100', name: 'Shipping Revenue', type: 'revenue' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { code: '5100', name: 'Shipping Expense', type: 'expense' },
    { code: '5200', name: 'Packaging Expense', type: 'expense' },
    { code: '5300', name: 'Salaries Expense', type: 'expense' },
    { code: '5400', name: 'Rent Expense', type: 'expense' },
    { code: '5500', name: 'Marketing Expense', type: 'expense' },
    { code: '5600', name: 'Refunds & Returns', type: 'expense' },
    { code: '5900', name: 'Other Expense', type: 'expense' },
  ];

  const created: IAccount[] = [];
  for (const acc of defaults) {
    const existing = await Account.findOne({ code: acc.code });
    if (!existing) {
      created.push(await Account.create(acc));
    }
  }
  return created;
};
