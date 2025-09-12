const { User } = require('../models');

async function resetStudentPassword() {
  try {
    const user = await User.findOne({ where: { email: 'student@example.com' } });
    if (!user) {
      console.error('Student user not found');
      process.exit(1);
    }
    
    // This will trigger the beforeUpdate hook which will hash the password correctly
    await user.update({ password: 'student123' });
    console.log('Password updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

resetStudentPassword();
