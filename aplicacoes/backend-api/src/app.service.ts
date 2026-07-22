import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      message: 'Vetting 2.0 System Backend is running',
    };
  }

  getInfo() {
    return {
      name: 'Vetting 2.0 System',
      description: 'Complete driver vetting workflow with 34 states',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        api: '/api/v1',
        docs: '/api/docs',
        health: '/health',
      },
      modules: [
        'Authentication (Google OAuth + JWT)',
        'Drivers (CRUD)',
        'Pre-registration',
        'Pre-screening (RTW, age, experience)',
        'Interview Management',
        'Document Management',
        'Vetting Review',
        'DHL Integration',
        'State Machine (34 states)',
        'Email Automation',
        'Lifecycle Monitoring',
        'Admin Dashboard',
      ],
      features: [
        'SLA tracking (<1h pre-screen, 24h insurance, 48h interview, D+3 DHL auto-chase)',
        'Audit trail for all state transitions',
        'Document upload & validation',
        'DHL APHIDS integration',
        'SendGrid email automation',
        'Google Cloud Storage',
        'Redis task queue (Bull)',
        'PostgreSQL ACID transactions',
      ],
    };
  }
}
