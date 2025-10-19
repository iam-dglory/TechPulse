# =€ START HERE - TechPulze Voting System

##  Your Voting System is Ready!

I've successfully built and integrated a complete 5-dimensional voting interface for TechPulze. Here's how to test it.

---

## <¯ 3 Ways to Start the Server

### **Option 1: PowerShell (Recommended for Windows)**
1. Right-click on `start-server.ps1`
2. Select **"Run with PowerShell"**
3. Wait for server to start

### **Option 2: VS Code Terminal (Best for Development)**
1. Open this folder in VS Code
2. Press `Ctrl + `` (backtick) to open terminal
3. Run: `npm run dev`
4. Wait for " Ready" message

### **Option 3: Command Prompt**
1. Open Command Prompt
2. Navigate: `cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze`
3. Run: `npm run dev`

---

## < Access the Application

Once server is running, open your browser:

```
http://localhost:3000/companies/[company-id]
```

**Replace `[company-id]` with an actual company ID from your Supabase database.**

Example:
```
http://localhost:3000/companies/550e8400-e29b-41d4-a716-446655440000
```

---

## <¬ What You'll See

### On the Company Page:
1. **Company header** with logo and info
2. **Ethics score circle** (top right)
3. **Products section**
4. **Ethical policies accordion**
5. **Reviews section**
6. **=ó VOTING INTERFACE**  This is new!

### The Voting Interface:
- **5 interactive sliders** with emojis
- **Real-time impact preview**
- **Vote weight badge** (e.g., "1.5x Analyst")
- **Optional comment & evidence fields**
- **Submit button** with confetti animation

---

## = Authentication States

### **Not Logged In:**
- Interface is **blurred**
- "Sign In to Vote" overlay appears
- Click button to sign in

### **Logged In:**
- Clear, interactive interface
- All sliders work
- Can submit votes
- Votes are saved to Supabase

---

## ( Features to Test

### 1. **Interactive Sliders**
- Move each slider (1-10)
- Watch emoji change: = ’ = ’ =
 ’ < ’ =€
- See score label update

### 2. **Impact Preview**
- As you move sliders, see:
- "Your vote will move Ethics from 7.2 to 7.3"
- Shows real-time calculation

### 3. **Vote Weight**
- Top right shows: "Your vote weight: 1.5x (Analyst)"
- Based on your reputation score

### 4. **Comments & Evidence**
- Click "Add comment & evidence"
- Type optional comment (max 500 chars)
- Add evidence URL
- Character counter updates

### 5. **Submit Votes**
- Click "Submit All Votes"
- See loading state
- Confetti animation! <‰
- Toast notification
- Page refreshes

### 6. **Edit Previous Votes**
- Reload page after voting
- Sliders show your previous scores
- Comments are pre-filled
- Can update and resubmit

---

## =Ê Vote Dimensions & Weights

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Ethics** | 30% | Privacy, AI ethics, labor, environment |
| **Credibility** | 25% | Trust, transparency, compliance |
| **Delivery** | 20% | Promise fulfillment, product delivery |
| **Security** | 15% | Data protection, breach history |
| **Innovation** | 10% | R&D, market disruption |

---

## =à Troubleshooting

### L Server Won't Start
**See:** `QUICK_START_TROUBLESHOOTING.md`

### L "localhost refused to connect"
**Solution:** Start the server first (see options above)

### L Can't find company page
**Solution:** Make sure you have companies in your Supabase database

### L "Sign In to Vote" won't go away
**Solution:** Make sure you're logged in via Supabase Auth

### L Votes not saving
**Solution:** Check Supabase connection in `.env.local`

---

## =Ú Documentation

Detailed docs available in:

| File | Purpose |
|------|---------|
| **VOTING_SETUP_GUIDE.md** | Complete setup & testing guide |
| **QUICK_START_TROUBLESHOOTING.md** | Fix server startup issues |
| **src/components/voting/README.md** | Component documentation |
| **src/components/voting/USAGE_EXAMPLE.tsx** | Code examples |

---

##  Quick Test Checklist

Before reporting issues:

- [ ] Server is running (see terminal output)
- [ ] Browser is open to `http://localhost:3000`
- [ ] Navigated to a company page (not homepage)
- [ ] Scrolled down to see voting interface
- [ ] If blurred, tried logging in
- [ ] Checked browser console (F12) for errors
- [ ] Checked terminal for server errors

---

## <¨ What Was Built

### **Components:**
 VotingInterface - Main voting UI with 5 sliders
 API endpoint for vote submission
 Integration with company detail page

### **Features:**
 5-dimensional scoring
 Real-time impact preview
 Vote weighting (1.0x - 3.0x)
 Emoji feedback
 Comments & evidence
 Authentication gate
 Success animations
 Dark/light theme
 Mobile responsive
 TypeScript type safety
 Error handling

---

## =' Database Requirements

Make sure your Supabase has:

### **Tables:**
-  `votes` - Store user votes
-  `companies` - With score columns
-  `user_profiles` - For vote weighting

### **Columns in companies table:**
- `ethics_score` (decimal)
- `credibility_score` (decimal)
- `delivery_score` (decimal)
- `security_score` (decimal)
- `innovation_score` (decimal)

**SQL setup:** See `VOTING_SETUP_GUIDE.md` section "Database Setup"

---

## <¯ Next Steps

1. **Start server** (see options above)
2. **Test voting** on a company page
3. **Review documentation** for advanced features
4. **Configure database triggers** (optional, for auto-scoring)
5. **Customize styling** (if needed)

---

## =¡ Pro Tips

### Tip 1: Use VS Code
Best development experience on Windows.

### Tip 2: Keep Terminal Open
Don't close it while testing - server runs there.

### Tip 3: Check Console
Press F12 in browser to see detailed errors.

### Tip 4: Auto-Reload
Save files in VS Code, page auto-refreshes!

### Tip 5: Test Authentication
Use Supabase dashboard to create test users.

---

## <˜ Need Help?

### Server won't start?
’ Read: `QUICK_START_TROUBLESHOOTING.md`

### Interface not showing?
’ Check: You're on `/companies/[id]` page, not homepage

### Votes not saving?
’ Verify: `.env.local` has correct Supabase credentials

### Other issues?
’ Check browser console (F12) and terminal for errors

---

## <‰ Success Indicators

You'll know it's working when:

 Server shows " Ready in X.Xs"
 Company page loads without errors
 Voting interface visible at bottom
 Sliders are interactive
 Emojis change when you move sliders
 Submit button works
 Confetti appears after submission
 Toast notification shows success

---

## =Í Your Location

```
Current project: C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze
Tech stack: Next.js 15, React 19, TypeScript, Supabase
Port: http://localhost:3000 (or 3002)
```

---

## =€ Ready to Test!

**Quick Start:**
1. Right-click `start-server.ps1` ’ Run with PowerShell
2. Wait for " Ready" message
3. Open browser: `http://localhost:3000/companies/[id]`
4. Scroll down to see voting interface
5. Test it out! =ó

**Happy voting!** <Š

---

*Built with d using Next.js 15, React 19, TypeScript, and Supabase*
