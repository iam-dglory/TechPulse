// app/components/companies/ClaimCompanyButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Building, Upload } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ClaimCompanyButtonProps {
  companyId: string;
  companyName: string;
}

export default function ClaimCompanyButton({ companyId, companyName }: ClaimCompanyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [officialEmail, setOfficialEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload proof file to Supabase Storage
      let proofUrl = '';
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `company-claims/${companyId}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('proofs')
          .upload(filePath, proofFile);
          
        if (uploadError) throw new Error('Failed to upload proof file');
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('proofs')
          .getPublicUrl(filePath);
          
        proofUrl = publicUrl;
      }

      // Submit claim request
      const response = await fetch(`/api/companies/${companyId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          official_email: officialEmail,
          website,
          proof_url: proofUrl,
          additional_info: additionalInfo
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit claim');
      }

      toast({
        title: 'Claim submitted successfully',
        description: 'We will review your claim and get back to you soon.',
        variant: 'default',
      });

      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error submitting claim',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
      >
        <Building className="h-4 w-4" />
        Claim Company
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Claim {companyName}</DialogTitle>
            <DialogDescription>
              Submit your claim to verify ownership of this company. Our team will review your request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="officialEmail">Official Company Email</Label>
              <Input
                id="officialEmail"
                type="email"
                placeholder="name@company.com"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Must be an email with your company domain</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofFile">Upload Proof Document</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="proofFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload business registration, company ID, or other proof of ownership
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional details to help verify your claim..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}