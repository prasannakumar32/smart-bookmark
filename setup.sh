#!/bin/bash

# Smart Bookmarks - Setup and Deployment Guide

echo "===== Smart Bookmarks Setup ====="
echo ""
echo "This script guides you through setting up and deploying Smart Bookmarks"
echo ""

# Check for required tools
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git first."
    exit 1
fi

echo "Step 1: Create a GitHub repository"
echo "- Go to https://github.com/new"
echo "- Create a new repository named 'smart-bookmark'"
echo "- Copy the repository URL"
echo ""

read -p "Enter your GitHub repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "No repository URL provided. Exiting."
    exit 1
fi

echo ""
echo "Step 2: Initialize git and push code"
git init
git add .
git commit -m "Initial commit: Smart Bookmarks app"
git branch -M main
git remote add origin "$REPO_URL"
git push -u origin main

echo ""
echo "Step 3: Set up Supabase"
echo "- Go to https://supabase.com and create a new project"
echo "- In the SQL Editor, run the SQL from database.sql"
echo "- In Authentication > Providers, enable Google OAuth"
echo "- Get your Supabase URL and Anon Key from Settings > API"
echo ""

read -p "Enter your Supabase URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY

echo ""
echo "Step 4: Deploy to Vercel"
echo "- Go to https://vercel.com/new"
echo "- Import your GitHub repository"
echo "- Add these environment variables:"
echo "  - NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
echo "- Click Deploy"
echo ""

echo "Setup complete! Your app will be available at https://<your-vercel-domain>.vercel.app"
echo ""
echo "After deployment:"
echo "1. Get your Vercel domain"
echo "2. Update Google OAuth redirect URIs with your Vercel domain"
echo "3. Update Supabase Auth Providers redirect URLs"
