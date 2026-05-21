#!/usr/bin/env perl

# Script to remove blank lines between import statements
# Usage: perl scripts/fix-import-newlines.pl [file1] [file2] ...
# Or: ./scripts/fix-import-newlines.pl (automatically scans src/ folder)

use strict;
use warnings;

# If no arguments provided, automatically find files in src/
if (@ARGV == 0) {
    my $find_cmd = q{find src -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*"};
    @ARGV = split /\n/, `$find_cmd`;
    print "Scanning " . scalar(@ARGV) . " files in src/...\n\n";
}

foreach my $file (@ARGV) {
    next unless -f $file;
    
    # Read the entire file
    open my $fh, '<', $file or die "Cannot open $file: $!";
    my $content = do { local $/; <$fh> };
    close $fh;
    
    # Store original content to check if changes were made
    my $original = $content;
    
    # Remove blank lines between import statements.
    # Handles both single-line and multi-line imports.
    #
    # Pattern 1: any line ending with  from '...'  or  from "..."
    #   This covers the closing line of multi-line imports (} from '...')
    #   as well as single-line imports (import { X } from '...').
    #   The lookahead ensures we only strip blanks that are immediately
    #   followed by another import statement, never before regular code.
    $content =~ s/(from\s+['"][^'"]+['"]\s*;?\n)\n+(?=\s*import[\s{])/$1/gm;

    # Pattern 2: side-effect imports with no 'from' keyword: import 'module'
    $content =~ s/(^import\s+['"][^'"]+['"]\s*;?\n)\n+(?=\s*import[\s{])/$1/gm;
    
    # Write back only if content changed
    if ($content ne $original) {
        open my $out, '>', $file or die "Cannot write to $file: $!";
        print $out $content;
        close $out;
        print "Fixed: $file\n";
    }
}
