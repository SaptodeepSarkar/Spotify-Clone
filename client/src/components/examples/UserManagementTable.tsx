import UserManagementTable from '../UserManagementTable';

export default function UserManagementTableExample() {
  const mockUsers = [
    { id: '1', username: 'admin', role: 'admin', suspended: false },
    { id: '2', username: 'john_doe', role: 'user', suspended: false },
    { id: '3', username: 'jane_smith', role: 'user', suspended: true, suspendedUntil: '2024-12-31' },
    { id: '4', username: 'bob_wilson', role: 'user', suspended: false },
  ];

  return (
    <div className="p-8">
      <UserManagementTable
        users={mockUsers}
        onSuspend={(id) => console.log('Suspend user:', id)}
        onUnsuspend={(id) => console.log('Unsuspend user:', id)}
      />
    </div>
  );
}
