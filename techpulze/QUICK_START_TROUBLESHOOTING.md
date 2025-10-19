# =¨ Quick Start Troubleshooting - ERR_CONNECTION_REFUSED

## Problem: "localhost refused to connect"

This means the Next.js development server isn't running. Let's fix it!

---

##  Solution 1: Start Server from VS Code Terminal

### Step 1: Open VS Code
Open your `techpulze` folder in VS Code:
```
File > Open Folder > C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze
```

### Step 2: Open Terminal
In VS Code:
- Press `Ctrl + `` (backtick)
- Or go to: `Terminal > New Terminal`

### Step 3: Start the Server
In the terminal, run:
```bash
npm run dev
```

### Step 4: Wait for Success Message
You should see:
```
 Ready in 2.5s
Ë Local:   http://localhost:3000
```

### Step 5: Open in Browser
Navigate to:
```
http://localhost:3000/companies/[company-id]
```

Replace `[company-id]` with an actual company ID from your database.

---

##  Solution 2: Check if Server is Already Running

### Check Running Processes
```bash
netstat -ano | findstr :3000
```

If you see output, a server is already running on port 3000.

### Kill the Process (if needed)
```bash
taskkill /PID [process-id] /F
```

Replace `[process-id]` with the number from the netstat output.

Then restart:
```bash
npm run dev
```

---

##  Solution 3: Use a Different Port

If port 3000 is busy:

```bash
npm run dev -- --port 3002
```

Then visit: `http://localhost:3002`

---

##  Solution 4: Check Node.js Installation

### Verify Node.js is Installed
```bash
node --version
```

Should show: `v18.x.x` or higher

### Verify npm is Installed
```bash
npm --version
```

Should show: `9.x.x` or higher

### If Not Installed:
1. Download from: https://nodejs.org/
2. Install the LTS version
3. Restart your computer
4. Try again

---

##  Solution 5: Reinstall Dependencies

If the server won't start:

```bash
# Delete node_modules
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Start server
npm run dev
```

---

## <¯ Quick Start Checklist

Before testing the voting interface:

- [ ] **Node.js installed** (run: `node --version`)
- [ ] **npm installed** (run: `npm --version`)
- [ ] **Dependencies installed** (run: `npm install` in techpulze folder)
- [ ] **Supabase configured** (check `.env.local` file exists)
- [ ] **Terminal open** in VS Code
- [ ] **Server running** (run: `npm run dev`)
- [ ] **Browser open** to `http://localhost:3000`

---

## =Ý Expected Output When Server Starts

You should see something like this:

```
> techpulze@0.1.0 dev
> next dev --turbopack

  ² Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

  Starting...
  Ready in 2.5s
 Ë Compiling / ...
  Compiled / in 1.2s
```

---

## = Common Errors and Fixes

### Error: "Cannot find module 'next'"
**Fix:** Install dependencies
```bash
npm install
```

### Error: "Port 3000 is already in use"
**Fix:** Use different port
```bash
npm run dev -- --port 3002
```

### Error: "ENOENT: no such file or directory"
**Fix:** Make sure you're in the right directory
```bash
cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze
```

### Error: "Invalid environment variables"
**Fix:** Check `.env.local` file exists with Supabase credentials
```
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## <¬ Step-by-Step: Complete Startup Guide

### 1. Open Terminal in Correct Directory
```bash
cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze
```

### 2. Verify You're in Right Place
```bash
dir
```
You should see: `package.json`, `src/`, `.env.local`

### 3. Install Dependencies (First Time Only)
```bash
npm install
```
Wait for it to complete...

### 4. Start Development Server
```bash
npm run dev
```
Wait for " Ready in X.Xs" message

### 5. Open Browser
Navigate to: `http://localhost:3000`

### 6. Find a Company Page
Go to: `http://localhost:3000/companies/[company-id]`

### 7. Scroll Down
Look for the **VotingInterface** component at the bottom

### 8. Test Voting!
- Move sliders
- Add comments
- Submit votes
- See confetti! <‰

---

## <˜ Still Not Working?

### Check These:

1. **Is VS Code open?** Open the techpulze folder
2. **Is terminal open?** Press `Ctrl + `` in VS Code
3. **Are you in techpulze folder?** Run: `pwd` or `cd`
4. **Did you run npm install?** Should see node_modules folder
5. **Is .env.local configured?** Should have Supabase credentials
6. **Is port free?** Try: `npm run dev -- --port 3002`

### Get More Help:
- Check `VOTING_SETUP_GUIDE.md` for detailed setup
- Check `src/components/voting/README.md` for component docs
- Check browser console (F12) for JavaScript errors
- Check terminal for server errors

---

##  Successful Startup Looks Like This:

### Terminal Output:
```
> techpulze@0.1.0 dev
> next dev --turbopack

  ² Next.js 15.0.0
  - Local:        http://localhost:3000

  Ready in 2.5s
```

### Browser:
- Company page loads
- Voting interface visible
- 5 sliders interactive
- No errors in console (F12)

---

## <¯ Testing the Voting Interface

Once server is running:

1. **Navigate to company page:**
   ```
   http://localhost:3000/companies/[any-company-id]
   ```

2. **Scroll down** - you'll see the VotingInterface

3. **If not logged in:**
   - See blurred interface
   - "Sign In to Vote" overlay

4. **If logged in:**
   - Interactive sliders
   - Vote weight badge
   - Submit button

5. **Test it:**
   - Move sliders (1-10)
   - Watch emojis change
   - See impact preview
   - Add optional comment
   - Click "Submit Votes"
   - See success animation! <‰

---

## =¡ Pro Tips

### Tip 1: Keep Terminal Open
Don't close the terminal while testing - the server runs there.

### Tip 2: Auto-Reload
Next.js auto-reloads when you save files. No need to restart!

### Tip 3: Check Console
Press F12 in browser to see any errors.

### Tip 4: Use VS Code
VS Code terminal is easier than Command Prompt on Windows.

### Tip 5: Clear Cache
If something looks broken, try: `Ctrl + Shift + R` in browser

---

## <Š You're Ready!

Once you see the server running message, you're all set to test the voting interface!

**Next:** Follow the testing checklist in `VOTING_SETUP_GUIDE.md`

Happy coding! =€
