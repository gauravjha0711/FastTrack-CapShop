pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build .NET Services') {
            steps {
                bat 'dotnet build CapShop.sln'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend\\capshop-client') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'CapShop CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check console output.'
        }
    }
}