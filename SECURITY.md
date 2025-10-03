# 🔐 Security Guidelines for TheTribe

## ⚠️ CRITICAL SECURITY RULES

### 1. Environment Variables
- **NEVER** commit `.env` files to git
- Always use `.env.example` as template
- Keep Discord tokens absolutely secret
- Use strong, unique session secrets (32+ characters)

### 2. Discord Bot Token Security
- Bot tokens provide full access to your Discord application
- If compromised, immediately regenerate in Discord Developer Portal
- Never share tokens in chat, logs, or screenshots
- Store tokens only in environment variables

### 3. Database Security
- Use strong passwords for MongoDB
- Never expose database ports publicly
- Use authentication even in development
- Regular backups with encrypted storage

### 4. Session Security
- Generate cryptographically secure session secrets
- Use HTTPS in production (secure cookies)
- Set appropriate cookie expiration times
- Consider using Redis for session storage in production

### 5. Docker Security
- Never include secrets in Dockerfiles
- Use Docker secrets or environment variables
- Keep base images updated
- Use non-root users in containers

## 🚨 If Credentials Are Compromised

1. **Discord Bot Token**:
   - Go to Discord Developer Portal
   - Regenerate bot token immediately
   - Update environment variables
   - Restart all services

2. **Database Credentials**:
   - Change MongoDB passwords
   - Update connection strings
   - Restart database and applications

3. **Session Secrets**:
   - Generate new session secret
   - All users will be logged out
   - Update environment variables

## ✅ Security Checklist

- [ ] `.env` file is not committed to git
- [ ] Strong, unique passwords used
- [ ] HTTPS enabled in production
- [ ] Regular security updates applied
- [ ] Access logs monitored
- [ ] Backup strategy implemented
- [ ] Environment variables properly set

## 📞 Security Contact

If you discover a security vulnerability, please report it privately to the project maintainers.