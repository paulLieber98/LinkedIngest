{
  description = "LinkedIngest";
  
  deps = {
    python = ["python39"];
    nodejs = ["nodejs-18"];
    packages = [
      "python39Packages.pip"
      "python39Packages.virtualenv"
      "nodejs-18_x"
      "yarn"
    ];
  };
} 