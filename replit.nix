{ pkgs }: {
  deps = [
    # Node.js LTS (version 20)
    pkgs.nodejs_20
    
    # Package manager
    pkgs.nodePackages.npm
    
    # Development tools
    pkgs.nodePackages.nodemon
    
    # MySQL client tools
    pkgs.mysql80
    
    # Git for version control
    pkgs.git
    
    # Curl for testing API endpoints
    pkgs.curl
    
    # Process monitoring
    pkgs.htop
    
    # Text editors
    pkgs.vim
    pkgs.nano
  ];
  
  # Environment variables
  env = {
    NODE_ENV = "development";
    PORT = "3000";
  };
  
  # Shell configuration
  shell = pkgs.bash;
  
  # Language servers for better IDE experience
  languageServers = {
    typescript = {
      # TypeScript language server
      command = "${pkgs.nodePackages.typescript-language-server}/bin/typescript-language-server";
      args = [ "--stdio" ];
    };
    
    eslint = {
      # ESLint language server
      command = "${pkgs.nodePackages.eslint}/bin/eslint";
      args = [ "--stdin" "--stdin-filename" "$REPL_FILENAME" ];
    };
  };
}
