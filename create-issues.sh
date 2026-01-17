#!/bin/bash

# Script to create GitHub issues for the AMS project
# This script uses GitHub CLI (gh) to create issues from templates

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}GitHub CLI is installed and authenticated${NC}"
echo ""

# Get the repository owner and name
REPO_INFO=$(gh repo view --json owner,name -q '.owner.login + "/" + .name')
echo -e "Creating issues for repository: ${GREEN}${REPO_INFO}${NC}"
echo ""

# Directory containing issue templates
TEMPLATE_DIR=".github/ISSUE_TEMPLATES"

# Function to extract title from markdown frontmatter
get_title() {
    grep "^title:" "$1" | sed "s/^title: '\(.*\)'$/\1/"
}

# Function to extract labels from markdown frontmatter
get_labels() {
    grep "^labels:" "$1" | sed "s/^labels: '\(.*\)'$/\1/"
}

# Function to remove frontmatter from markdown file
remove_frontmatter() {
    sed '1,/^---$/d' "$1" | sed '1,/^---$/d'
}

# Function to create an issue
create_issue() {
    local template_file=$1
    local issue_num=$2
    
    if [ ! -f "$template_file" ]; then
        echo -e "${YELLOW}Skipping: Template file not found: $template_file${NC}"
        return
    fi
    
    local title=$(get_title "$template_file")
    local labels=$(get_labels "$template_file")
    
    # Create temporary file with body (without frontmatter)
    local temp_body=$(mktemp)
    remove_frontmatter "$template_file" > "$temp_body"
    
    echo -e "${YELLOW}Creating Issue #${issue_num}: ${title}${NC}"
    
    # Create the issue
    if gh issue create \
        --title "$title" \
        --body-file "$temp_body" \
        --label "$labels"; then
        echo -e "${GREEN}✓ Issue #${issue_num} created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create Issue #${issue_num}${NC}"
    fi
    
    # Clean up
    rm "$temp_body"
    echo ""
}

# Main execution
echo "This script will create GitHub issues for the AMS project."
echo "Issues will be created from templates in $TEMPLATE_DIR"
echo ""
read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Starting issue creation...${NC}"
echo ""

# Create issues in order
create_issue "$TEMPLATE_DIR/issue-01-attendance-model.md" 1
create_issue "$TEMPLATE_DIR/issue-02-attendance-controller.md" 2
create_issue "$TEMPLATE_DIR/issue-03-course-enrollment.md" 3
create_issue "$TEMPLATE_DIR/issue-04-attendance-frontend.md" 4
create_issue "$TEMPLATE_DIR/issue-05-assignment-model.md" 5
create_issue "$TEMPLATE_DIR/issue-06-assignment-controller.md" 6

echo ""
echo -e "${GREEN}Issue creation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review created issues at: https://github.com/$REPO_INFO/issues"
echo "2. Create remaining issues manually from ACTION_PLAN.md (Issues #7-15)"
echo "3. Set up project board and milestones"
echo "4. Assign issues to team members"
echo "5. Start with Phase 1 issues (#1, #2, #3)"
echo ""
echo "For detailed information, see:"
echo "- ACTION_PLAN.md - Complete project plan"
echo "- .github/ISSUE_TEMPLATES/README.md - Issue creation guide"
