'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDropzone } from 'react-dropzone'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Upload, 
  X, 
  Plus, 
  Save, 
  Send,
  Building2,
  TrendingUp,
  Package,
  Users,
  Shield
} from 'lucide-react'

interface Product {
  name: string
  description: string
  url: string
}

interface CompanyFormData {
  name: string
  logo_url: string | null
  industry: string
  funding_stage: string
  investors: string[]
  products: Product[]
  target_users: string
  ethical_policy: {
    privacy: string
    ai_transparency: string
    carbon_footprint: string
    data_handling: string
  }
}

const industries = [
  'AI', 'EV', 'IoT', 'HealthTech', 'FinTech', 'EdTech', 'Cybersecurity', 'Blockchain', 'AR/VR', 'Robotics'
]

const fundingStages = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Public', 'Acquired'
]

const commonTargetUsers = [
  'Developers', 'Enterprises', 'SMBs', 'Consumers', 'Government', 'Healthcare', 'Education', 'Finance'
]

export default function CreateCompanyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    logo_url: null,
    industry: '',
    funding_stage: '',
    investors: [],
    products: [],
    target_users: '',
    ethical_policy: {
      privacy: '',
      ai_transparency: '',
      carbon_footprint: '',
      data_handling: ''
    }
  })
  const [newInvestor, setNewInvestor] = useState('')
  const [newProduct, setNewProduct] = useState<Product>({ name: '', description: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Rich text editors
  const privacyEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Describe the company\'s privacy policy and data protection measures...'
      })
    ],
    content: formData.ethical_policy.privacy
  })

  const aiTransparencyEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Explain how the company handles AI transparency and explainability...'
      })
    ],
    content: formData.ethical_policy.ai_transparency
  })

  const carbonFootprintEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Describe the company\'s environmental impact and sustainability efforts...'
      })
    ],
    content: formData.ethical_policy.carbon_footprint
  })

  const dataHandlingEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Explain how the company handles and processes data...'
      })
    ],
    content: formData.ethical_policy.data_handling
  })

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setFormData(prev => ({ ...prev, logo_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: false
  })

  const addInvestor = () => {
    if (newInvestor.trim() && !formData.investors.includes(newInvestor.trim())) {
      setFormData(prev => ({
        ...prev,
        investors: [...prev.investors, newInvestor.trim()]
      }))
      setNewInvestor('')
    }
  }

  const removeInvestor = (investor: string) => {
    setFormData(prev => ({
      ...prev,
      investors: prev.investors.filter(i => i !== investor)
    }))
  }

  const addProduct = () => {
    if (newProduct.name.trim() && newProduct.description.trim() && newProduct.url.trim()) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { ...newProduct }]
      }))
      setNewProduct({ name: '', description: '', url: '' })
    }
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const saveDraft = async () => {
    setSaving(true)
    try {
      // Update form data with editor content
      const updatedFormData = {
        ...formData,
        ethical_policy: {
          privacy: privacyEditor?.getHTML() || '',
          ai_transparency: aiTransparencyEditor?.getHTML() || '',
          carbon_footprint: carbonFootprintEditor?.getHTML() || '',
          data_handling: dataHandlingEditor?.getHTML() || ''
        }
      }

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updatedFormData,
          verified: false,
          ethics_score: 0
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/companies/${data.company.id}`)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setSaving(false)
    }
  }

  const submitForVerification = async () => {
    setLoading(true)
    try {
      // Update form data with editor content
      const updatedFormData = {
        ...formData,
        ethical_policy: {
          privacy: privacyEditor?.getHTML() || '',
          ai_transparency: aiTransparencyEditor?.getHTML() || '',
          carbon_footprint: carbonFootprintEditor?.getHTML() || '',
          data_handling: dataHandlingEditor?.getHTML() || ''
        }
      }

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updatedFormData,
          verified: false,
          ethics_score: 0
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/companies/${data.company.id}`)
      }
    } catch (error) {
      console.error('Error submitting company:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Add New Company
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create a comprehensive company profile for TechPulze
            </p>
          </div>

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="users">Target Users</TabsTrigger>
              <TabsTrigger value="ethics">Ethics</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo</label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {formData.logo_url ? (
                        <div className="space-y-2">
                          <img
                            src={formData.logo_url}
                            alt="Company logo"
                            className="w-24 h-24 object-cover rounded-lg mx-auto"
                          />
                          <p className="text-sm text-gray-600">Click or drag to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-gray-600">
                            {isDragActive ? 'Drop the logo here' : 'Drag & drop logo or click to upload'}
                          </p>
                          <p className="text-sm text-gray-500">PNG, JPG, GIF, SVG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Funding Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Funding Stage</label>
                    <Select
                      value={formData.funding_stage}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, funding_stage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select funding stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundingStages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Investors</label>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          value={newInvestor}
                          onChange={(e) => setNewInvestor(e.target.value)}
                          placeholder="Add investor name"
                          onKeyPress={(e) => e.key === 'Enter' && addInvestor()}
                        />
                        <Button onClick={addInvestor} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.investors.map((investor) => (
                          <Badge key={investor} variant="secondary" className="flex items-center gap-1">
                            {investor}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => removeInvestor(investor)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Product name"
                      />
                      <Input
                        value={newProduct.url}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="Product URL"
                      />
                      <Button onClick={addProduct} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                    <Input
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Product description"
                    />
                  </div>

                  {formData.products.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Added Products</h4>
                      {formData.products.map((product, index) => (
                        <div key={index} className="border rounded-lg p-4 flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{product.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {product.url}
                            </a>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Target Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Users</label>
                    <Input
                      value={formData.target_users}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_users: e.target.value }))}
                      placeholder="Describe your target users (e.g., Developers, Enterprises, SMBs, Consumers)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Common options: {commonTargetUsers.join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ethics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Ethical Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Privacy Policy</label>
                    <div className="border rounded-lg p-4 min-h-[200px]">
                      <EditorContent editor={privacyEditor} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">AI Transparency</label>
                    <div className="border rounded-lg p-4 min-h-[200px]">
                      <EditorContent editor={aiTransparencyEditor} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Carbon Footprint</label>
                    <div className="border rounded-lg p-4 min-h-[200px]">
                      <EditorContent editor={carbonFootprintEditor} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data Handling</label>
                    <div className="border rounded-lg p-4 min-h-[200px]">
                      <EditorContent editor={dataHandlingEditor} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            
            <Button
              onClick={submitForVerification}
              disabled={loading || !formData.name || !formData.industry}
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}





