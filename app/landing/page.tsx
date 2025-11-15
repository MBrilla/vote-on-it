'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Input, Typography, Divider } from 'antd';
import { PlusOutlined, ArrowRightOutlined, BarChartOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface FormValues {
  question: string;
  options: string[];
}

export default function LandingPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: values.question,
          options: values.options.filter(option => option.trim() !== ''),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create poll');
      }

      router.push(`/poll/${data.data.code}`);
    } catch (error) {
      console.error('Error creating poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <ThunderboltOutlined className="text-2xl text-blue-500" />,
      title: 'Real-time Results',
      description: 'See votes come in live as they happen',
    },
    {
      icon: <TeamOutlined className="text-2xl text-green-500" />,
      title: 'Easy Sharing',
      description: 'Share your poll with a simple link',
    },
    {
      icon: <BarChartOutlined className="text-2xl text-purple-500" />,
      title: 'Detailed Analytics',
      description: 'View comprehensive voting statistics',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Create & Share Polls in Seconds
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Get instant feedback from your audience with our easy-to-use polling platform.
            Perfect for events, meetings, and quick surveys.
          </p>
          <Button
            type="primary"
            size="large"
            className="h-12 px-8 text-lg"
            onClick={() => document.getElementById('create-poll')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Create Your First Poll <ArrowRightOutlined />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Our Polling Tool?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Poll Section */}
      <section id="create-poll" className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <div className="text-center mb-8">
              <Title level={2} className="mb-2">Create a New Poll</Title>
              <Text type="secondary">It's quick and easy to get started</Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="question"
                label="What's your question?"
                rules={[{ required: true, message: 'Please enter a question' }]}
              >
                <Input 
                  placeholder="E.g., What should we have for lunch?" 
                  size="large"
                  className="py-2"
                />
              </Form.Item>

              <Form.List
                name="options"
                rules={[
                  {
                    validator: async (_, options) => {
                      if (!options || options.length < 2) {
                        return Promise.reject(new Error('At least 2 options are required'));
                      }
                      if (options.some((opt: string) => !opt.trim())) {
                        return Promise.reject(new Error('Options cannot be empty'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.key} className="flex items-center gap-2">
                          <Form.Item
                            {...field}
                            label={index === 0 ? 'Options' : ''}
                            required={false}
                            className="flex-1 mb-0"
                          >
                            <Input
                              placeholder={`Option ${index + 1}`}
                              className="py-2"
                            />
                          </Form.Item>
                          {fields.length > 2 && (
                            <Button
                              type="text"
                              danger
                              onClick={() => remove(field.name)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className="w-full"
                      >
                        Add Option
                      </Button>
                      <Form.ErrorList errors={errors} className="mt-2 text-red-500" />
                    </div>
                  </>
                )}
              </Form.List>

              <Form.Item className="mt-8 mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full h-12 text-lg"
                >
                  Create Poll <ArrowRightOutlined />
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to create your first poll?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of users who make better decisions with real-time feedback</p>
          <Button 
            size="large" 
            className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 text-lg"
            onClick={() => document.getElementById('create-poll')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started for Free
          </Button>
        </div>
      </section>
    </div>
  );
}
